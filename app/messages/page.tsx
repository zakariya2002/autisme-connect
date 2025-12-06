'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { Conversation, Message } from '@/types';
import { canEducatorCreateConversation } from '@/lib/subscription-utils';
import EducatorNavbar from '@/components/EducatorNavbar';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';
import Logo from '@/components/Logo';
import { moderateMessage, generateWarningMessage } from '@/lib/moderation';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showConversationList, setShowConversationList] = useState(true); // Pour mobile: bascule entre liste et conversation
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && userProfile) {
      fetchConversations();

      const educatorId = searchParams.get('educator');
      if (educatorId) {
        initializeConversation(educatorId);
      }
    }
  }, [currentUser, userProfile, searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      markMessagesAsRead();

      // Abonnement temps réel aux nouveaux messages
      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }
      setCurrentUser(session.user);

      // Vérifier d'abord si c'est un éducateur
      const { data: educatorProfile } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (educatorProfile) {
        setUserProfile({ ...educatorProfile, role: 'educator' });

        // Récupérer l'abonnement pour les éducateurs
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('educator_id', educatorProfile.id)
          .in('status', ['active', 'trialing'])
          .limit(1)
          .maybeSingle();

        setSubscription(subscriptionData);
        return;
      }

      // Sinon, vérifier si c'est une famille
      const { data: familyProfile } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (familyProfile) {
        setUserProfile({ ...familyProfile, role: 'family' });
        return;
      }

      console.error('Aucun profil trouvé pour cet utilisateur');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const initializeConversation = async (educatorId: string) => {
    if (userProfile?.role !== 'family') {
      return;
    }

    try {
      // Chercher ou créer la conversation
      let { data: conv, error } = await supabase
        .from('conversations')
        .select('*, educator_profiles(*), family_profiles(*)')
        .eq('educator_id', educatorId)
        .eq('family_id', userProfile.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Vérifier si l'éducateur peut accepter une nouvelle conversation
        const conversationCheck = await canEducatorCreateConversation(educatorId);
        if (!conversationCheck.canCreate) {
          alert(`Cet éducateur a atteint sa limite de conversations actives (${conversationCheck.limit}). Il doit passer Premium pour accepter plus de conversations.`);
          return;
        }

        // Créer la conversation avec statut "pending"
        const { data: newConv, error: insertError } = await supabase
          .from('conversations')
          .insert({
            educator_id: educatorId,
            family_id: userProfile.id,
            status: 'pending',
          })
          .select('*, educator_profiles(*), family_profiles(*)')
          .single();

        if (insertError) {
          console.error('Erreur création conversation:', insertError);
          throw insertError;
        }

        conv = newConv;
      } else if (error) {
        console.error('Erreur lors de la recherche de conversation:', error);
        throw error;
      }

      if (conv) {
        setSelectedConversation(conv);
        // Recharger la liste des conversations pour afficher la nouvelle
        await fetchConversations();
      }
    } catch (error) {
      console.error('Erreur initializeConversation:', error);
      alert('Impossible de créer la conversation. Vérifiez la console pour plus de détails.');
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const isEducator = userProfile.role === 'educator';
      const filterField = isEducator ? 'educator_id' : 'family_id';

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          educator_profiles(*),
          family_profiles(*)
        `)
        .eq(filterField, userProfile.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !currentUser) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConversation.id)
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    // Vérification de modération
    const isFirstMessage = selectedConversation.status === 'pending' || messages.length === 0;
    const moderationResult = moderateMessage(newMessage.trim(), isFirstMessage);

    if (!moderationResult.isAcceptable) {
      setModerationWarning(generateWarningMessage(moderationResult));
      return;
    }

    // Effacer l'avertissement précédent
    setModerationWarning(null);

    // Vérifier si la conversation est acceptée
    if (selectedConversation.status === 'pending' && userProfile.role === 'family') {
      // C'est le premier message - il sera stocké comme message de demande
      try {
        const { error } = await supabase
          .from('conversations')
          .update({ request_message: newMessage.trim() })
          .eq('id', selectedConversation.id);

        if (error) throw error;

        setNewMessage('');
        setSelectedConversation({ ...selectedConversation, request_message: newMessage.trim() });
        alert('Votre demande de contact a été envoyée ! L\'éducateur doit l\'accepter avant que vous puissiez échanger des messages.');
        fetchConversations();
      } catch (error) {
        console.error('Erreur:', error);
      }
      return;
    }

    // Si la conversation n'est pas acceptée et c'est un éducateur, on ne peut pas envoyer
    if (selectedConversation.status !== 'accepted') {
      alert('Cette conversation doit être acceptée avant de pouvoir échanger des messages.');
      return;
    }

    const isEducator = userProfile.role === 'educator';
    const receiverId = isEducator
      ? selectedConversation.family_profiles.user_id
      : selectedConversation.educator_profiles.user_id;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: currentUser.id,
          receiver_id: receiverId,
          content: newMessage.trim(),
        });

      if (error) throw error;

      // Mettre à jour la conversation
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      fetchConversations();
      fetchMessages();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAcceptConversation = async () => {
    if (!selectedConversation) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      if (error) throw error;

      setSelectedConversation({ ...selectedConversation, status: 'accepted' });
      fetchConversations();
      alert('Demande acceptée ! Vous pouvez maintenant échanger des messages.');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleRejectConversation = async () => {
    if (!selectedConversation) return;

    if (!confirm('Êtes-vous sûr de vouloir refuser cette demande de contact ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      if (error) throw error;

      setSelectedConversation(null);
      fetchConversations();
      alert('Demande refusée.');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Bloquer une famille
  const handleBlockFamily = async () => {
    if (!selectedConversation || !userProfile || userProfile.role !== 'educator') return;

    const familyId = selectedConversation.family_id;
    if (!familyId) return;

    setIsBlocking(true);
    try {
      const response = await fetch('/api/blocked-families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          educatorId: userProfile.id,
          familyId: familyId,
          reason: blockReason || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du blocage');
      }

      // Fermer le modal et la conversation
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedConversation(null);
      setShowConversationList(true);

      // Retirer la conversation de la liste
      setConversations(prev => prev.filter(c => c.family_id !== familyId));

      alert('La famille a été bloquée. Elle ne pourra plus vous contacter ni prendre de rendez-vous.');
    } catch (error: any) {
      console.error('Erreur blocage:', error);
      alert(error.message || 'Erreur lors du blocage de la famille');
    } finally {
      setIsBlocking(false);
    }
  };

  // Marquer une demande de contact comme vue par l'éducateur
  const markConversationAsSeen = async (conversationId: string) => {
    if (userProfile?.role !== 'educator') return;

    try {
      await supabase
        .from('conversations')
        .update({ educator_seen_at: new Date().toISOString() })
        .eq('id', conversationId)
        .is('educator_seen_at', null);
    } catch (error) {
      console.error('Erreur marquage conversation vue:', error);
    }
  };

  const getOtherParticipant = (conversation: any) => {
    const isEducator = userProfile.role === 'educator';
    return isEducator
      ? conversation.family_profiles
      : conversation.educator_profiles;
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isPremium = !!(subscription && ['active', 'trialing'].includes(subscription.status));

  // Composant pour afficher l'avatar
  const Avatar = ({ participant, size = 'md' }: { participant: any; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16'
    };

    if (participant?.avatar_url) {
      return (
        <img
          src={participant.avatar_url}
          alt={`${participant.first_name} ${participant.last_name}`}
          className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
        />
      );
    }

    // Avatar par défaut si pas de photo
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0`}>
        <span className="text-primary-600 font-semibold text-sm">
          {participant?.first_name?.[0]}{participant?.last_name?.[0]}
        </span>
      </div>
    );
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      {userProfile?.role === 'educator' ? (
        <EducatorNavbar profile={userProfile} subscription={subscription} />
      ) : (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Logo href="/dashboard/family" />
              <div className="md:hidden">
                <FamilyMobileMenu profile={userProfile} onLogout={handleLogout} />
              </div>
              <div className="hidden md:flex space-x-4 items-center">
                <Link
                  href="/dashboard/family"
                  className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tableau de bord
                </Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium transition">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Zone de messagerie */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-6 pb-10 sm:pb-12">
          <div className="h-full bg-white rounded-lg shadow flex">
            {/* Liste des conversations - affichée seulement sur desktop OU sur mobile quand aucune conversation sélectionnée */}
            <div className={`w-full lg:w-1/3 border-r border-gray-200 flex flex-col ${selectedConversation && !showConversationList ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Aucune conversation
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    if (!other) return null; // Ignorer les conversations sans profil valide
                    // Ne pas afficher les conversations refusées
                    if (conv.status === 'rejected') return null;
                    // Vérifier si l'autre personne est un éducateur ou une famille
                    const isOtherEducator = conv.educator_profiles?.id === other?.id;
                    const isOtherFamily = conv.family_profiles?.id === other?.id;
                    const profileUrl = isOtherEducator ? `/educator/${other?.id}` : (isOtherFamily ? `/family/${other?.id}` : null);
                    const isPending = conv.status === 'pending';

                    return (
                      <div
                        key={conv.id}
                        className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                          selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                        } ${isPending ? 'bg-yellow-50' : ''}`}
                        onClick={() => {
                          setSelectedConversation(conv);
                          setShowConversationList(false); // Masquer la liste sur mobile
                          // Marquer comme vue si c'est une demande pending vue par l'éducateur
                          if (conv.status === 'pending' && userProfile?.role === 'educator') {
                            markConversationAsSeen(conv.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 relative">
                            <Avatar participant={other} size="md" />
                            {isPending && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {other.first_name || 'Utilisateur'} {other.last_name || ''}
                              </p>
                              {isPending && (
                                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                  En attente
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {isPending ? (conv.request_message || 'Demande de contact') : (other.location || 'Localisation non renseignée')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Zone de conversation - affichée sur desktop OU sur mobile quand conversation sélectionnée */}
            <div className={`flex-1 flex flex-col ${!selectedConversation || showConversationList ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto`}>
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Sélectionnez une conversation
                </div>
              ) : (
                <>
                  {/* En-tête de la conversation */}
                  <div className="p-4 border-b border-gray-200">
                    {/* Bouton retour pour mobile */}
                    <button
                      onClick={() => setShowConversationList(true)}
                      className="lg:hidden mb-3 flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Retour aux conversations
                    </button>
                    {(() => {
                      const other = getOtherParticipant(selectedConversation);
                      // Vérifier si l'autre personne est un éducateur ou une famille
                      const isOtherEducator = selectedConversation.educator_profiles?.id === other?.id;
                      const isOtherFamily = selectedConversation.family_profiles?.id === other?.id;
                      const profileUrl = isOtherEducator ? `/educator/${other?.id}` : (isOtherFamily ? `/family/${other?.id}` : null);
                      const appointmentUrl = isOtherEducator ? `/educator/${other?.id}/book-appointment` : (isOtherFamily ? `/family/${other?.id}/request-appointment` : null);
                      const appointmentLabel = isOtherEducator ? 'Demander un rendez-vous' : 'Proposer un rendez-vous';

                      return (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar participant={other} size="lg" />
                            <div>
                              {profileUrl ? (
                                <Link href={profileUrl}>
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer transition-colors">
                                    {other?.first_name || 'Utilisateur'}{' '}
                                    {other?.last_name || ''}
                                  </h3>
                                </Link>
                              ) : (
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {other?.first_name || 'Utilisateur'}{' '}
                                  {other?.last_name || ''}
                                </h3>
                              )}
                              <p className="text-sm text-gray-500">
                                {other?.location || 'Localisation non renseignée'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {appointmentUrl && (
                              <Link
                                href={appointmentUrl}
                                className="inline-flex items-center px-3 py-2 sm:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-xs sm:text-sm"
                              >
                                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="hidden sm:inline">{appointmentLabel}</span>
                                <span className="sm:hidden">RDV</span>
                              </Link>
                            )}
                            {/* Bouton bloquer pour les éducateurs */}
                            {userProfile?.role === 'educator' && isOtherFamily && (
                              <button
                                onClick={() => setShowBlockModal(true)}
                                className="inline-flex items-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium transition-colors text-xs sm:text-sm"
                                title="Bloquer cette famille"
                              >
                                <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span className="hidden sm:inline">Bloquer</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Messages ou zone de demande en attente */}
                  {selectedConversation.status === 'pending' ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Zone de demande en attente */}
                      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-8">
                        <div className="text-center max-w-lg mx-auto pb-6">
                          {userProfile.role === 'educator' ? (
                            <>
                              <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">Nouvelle demande</h3>
                                  <p className="text-sm text-gray-600">{getOtherParticipant(selectedConversation)?.first_name} souhaite vous contacter</p>
                                </div>
                              </div>
                              {/* Affichage des données du questionnaire */}
                              {selectedConversation.questionnaire_data && (
                                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-3 sm:p-4 mb-4 text-left border border-primary-200">
                                  <p className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Informations de la demande
                                  </p>

                                  <div className="space-y-2 text-sm">
                                    {/* Accompagnement */}
                                    {selectedConversation.questionnaire_data.child_name && (
                                      <div className="flex items-center gap-2">
                                        <span className="flex-shrink-0">👤</span>
                                        <span className="text-xs text-gray-500">Pour :</span>
                                        <span className="font-medium text-gray-800">{selectedConversation.questionnaire_data.child_name}</span>
                                      </div>
                                    )}

                                    {/* Suivi existant */}
                                    {selectedConversation.questionnaire_data.existing_support && (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="flex-shrink-0">{selectedConversation.questionnaire_data.existing_support.has_support ? '✅' : '❌'}</span>
                                        <span className="text-xs text-gray-500">Suivi :</span>
                                        <span className="font-medium text-gray-800 text-sm">
                                          {selectedConversation.questionnaire_data.existing_support.has_support
                                            ? `${selectedConversation.questionnaire_data.existing_support.types?.join(', ') || 'Oui'}`
                                            : 'Aucun'}
                                        </span>
                                      </div>
                                    )}

                                    {/* Besoins */}
                                    {selectedConversation.questionnaire_data.needs && (
                                      <>
                                        {selectedConversation.questionnaire_data.needs.accompaniment_types?.length > 0 && (
                                          <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0">🎯</span>
                                            <div className="min-w-0 flex-1">
                                              <div className="flex flex-wrap gap-1">
                                                {selectedConversation.questionnaire_data.needs.accompaniment_types.map((type: string) => (
                                                  <span key={type} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium capitalize">
                                                    {type.replace('_', ' ')}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        {selectedConversation.questionnaire_data.needs.objectives?.length > 0 && (
                                          <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0">💡</span>
                                            <div className="min-w-0 flex-1">
                                              <div className="flex flex-wrap gap-1">
                                                {selectedConversation.questionnaire_data.needs.objectives.map((obj: string) => (
                                                  <span key={obj} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                                                    {obj.replace('_', ' ')}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* Modalités */}
                                    {selectedConversation.questionnaire_data.modalities && (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="flex-shrink-0">📍</span>
                                        <span className="font-medium text-gray-800 text-sm">
                                          {selectedConversation.questionnaire_data.modalities.location && (
                                            <span className="mr-1">
                                              {selectedConversation.questionnaire_data.modalities.location === 'domicile' ? 'Domicile' :
                                               selectedConversation.questionnaire_data.modalities.location === 'cabinet' ? 'Cabinet' :
                                               selectedConversation.questionnaire_data.modalities.location === 'ecole' ? 'École' : 'Flexible'}
                                            </span>
                                          )}
                                          {selectedConversation.questionnaire_data.modalities.frequency && (
                                            <span className="text-gray-600">
                                              • {selectedConversation.questionnaire_data.modalities.frequency === '1x_semaine' ? '1x/sem' :
                                                 selectedConversation.questionnaire_data.modalities.frequency === '2x_semaine' ? '2x/sem' :
                                                 selectedConversation.questionnaire_data.modalities.frequency === 'plus' ? '+2x/sem' : 'À définir'}
                                            </span>
                                          )}
                                        </span>
                                        {selectedConversation.questionnaire_data.modalities.availability?.length > 0 && (
                                          <span className="text-xs text-gray-500">
                                            ({selectedConversation.questionnaire_data.modalities.availability.map((a: string) =>
                                              a === 'matin' ? 'Mat.' :
                                              a === 'apres_midi' ? 'AM' :
                                              a === 'soir' ? 'Soir' : 'WE'
                                            ).join(', ')})
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {selectedConversation.request_message && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                                  <p className="text-gray-800 italic text-sm break-words">"{selectedConversation.request_message}"</p>
                                </div>
                              )}
                              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4 pt-4 border-t border-gray-100">
                                <button
                                  onClick={handleAcceptConversation}
                                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:shadow-lg"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Accepter
                                </button>
                                <button
                                  onClick={handleRejectConversation}
                                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:shadow-lg"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Refuser
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                {(selectedConversation.request_message || selectedConversation.questionnaire_data) ? 'Demande envoyée' : 'Envoyez votre demande'}
                              </h3>
                              {selectedConversation.request_message || selectedConversation.questionnaire_data ? (
                                <>
                                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                                    Votre demande de contact est en attente de validation par l'éducateur.
                                  </p>
                                  {/* Récapitulatif du questionnaire envoyé */}
                                  {selectedConversation.questionnaire_data && (
                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-3 sm:p-4 mb-4 text-left border border-green-200">
                                      <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Votre demande envoyée
                                      </p>
                                      <div className="space-y-2 text-xs sm:text-sm">
                                        {selectedConversation.questionnaire_data.child_name && (
                                          <p className="break-words"><span className="text-gray-500">Pour :</span> <span className="font-medium">{selectedConversation.questionnaire_data.child_name}</span></p>
                                        )}
                                        {selectedConversation.questionnaire_data.needs?.accompaniment_types?.length > 0 && (
                                          <p className="break-words"><span className="text-gray-500">Accompagnement :</span> <span className="font-medium">{selectedConversation.questionnaire_data.needs.accompaniment_types.map((t: string) => t.replace('_', ' ')).join(', ')}</span></p>
                                        )}
                                        {selectedConversation.questionnaire_data.modalities?.location && (
                                          <p><span className="text-gray-500">Lieu :</span> <span className="font-medium">
                                            {selectedConversation.questionnaire_data.modalities.location === 'domicile' ? 'À domicile' :
                                             selectedConversation.questionnaire_data.modalities.location === 'cabinet' ? 'En cabinet' :
                                             selectedConversation.questionnaire_data.modalities.location === 'ecole' ? 'À l\'école' : 'Peu importe'}
                                          </span></p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {selectedConversation.request_message && (
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-left">
                                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Votre message :</p>
                                      <p className="text-gray-800 italic text-sm sm:text-base break-words">"{selectedConversation.request_message}"</p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm sm:text-base text-gray-600">
                                  Présentez-vous à l'éducateur pour qu'il puisse accepter votre demande de contact.
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Formulaire d'envoi pour les familles en attente */}
                      {userProfile.role === 'family' && !selectedConversation.request_message && !selectedConversation.questionnaire_data && (
                        <div className="p-3 sm:p-4 border-t border-gray-200">
                          <form onSubmit={sendMessage} className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Présentez-vous..."
                              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                            />
                            <button
                              type="submit"
                              className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium text-sm sm:text-base w-full sm:w-auto"
                            >
                              Envoyer
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Messages normaux pour les conversations acceptées */}
                      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {messages.map((message) => {
                          const isSender = message.sender_id === currentUser?.id;
                          const other = getOtherParticipant(selectedConversation);
                          return (
                            <div
                              key={message.id}
                              className={`flex items-end gap-1.5 sm:gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}
                            >
                              {/* Avatar pour les messages reçus */}
                              {!isSender && <Avatar participant={other} size="sm" />}

                              <div
                                className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                                  isSender
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                }`}
                              >
                                <p className="text-sm sm:text-base break-words">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isSender ? 'text-primary-100' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Formulaire d'envoi */}
                      <div className="p-3 sm:p-4 border-t border-gray-200">
                        {/* Avertissement de modération */}
                        {moderationWarning && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-red-700">{moderationWarning}</p>
                              <button
                                onClick={() => setModerationWarning(null)}
                                className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                              >
                                Fermer
                              </button>
                            </div>
                          </div>
                        )}
                        <form onSubmit={sendMessage} className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              if (moderationWarning) setModerationWarning(null);
                            }}
                            placeholder="Message..."
                            className={`flex-1 border rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base min-w-0 ${
                              moderationWarning ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                          <button
                            type="submit"
                            className="px-3 sm:px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex-shrink-0 text-sm sm:text-base"
                          >
                            <span className="hidden sm:inline">Envoyer</span>
                            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de blocage */}
      {showBlockModal && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bloquer cette famille ?</h3>
                <p className="text-sm text-gray-600">
                  {selectedConversation.family_profiles?.first_name} {selectedConversation.family_profiles?.last_name}
                </p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">
                <strong>Attention :</strong> Cette famille ne pourra plus :
              </p>
              <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                <li>Voir votre profil</li>
                <li>Vous envoyer de messages</li>
                <li>Prendre de rendez-vous avec vous</li>
              </ul>
              <p className="text-sm text-red-600 mt-2">
                Les rendez-vous en attente seront annulés.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison du blocage (optionnel)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Comportement inapproprié, harcèlement..."
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-red-500 focus:border-red-500"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                disabled={isBlocking}
              >
                Annuler
              </button>
              <button
                onClick={handleBlockFamily}
                disabled={isBlocking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition flex items-center justify-center gap-2"
              >
                {isBlocking ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Blocage...
                  </>
                ) : (
                  'Confirmer le blocage'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
