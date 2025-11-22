'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { Conversation, Message } from '@/types';
import { canEducatorCreateConversation } from '@/lib/subscription-utils';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';
import FamilyMobileMenu from '@/components/FamilyMobileMenu';

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

        // Créer la conversation
        const { data: newConv, error: insertError } = await supabase
          .from('conversations')
          .insert({
            educator_id: educatorId,
            family_id: userProfile.id,
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

  const getOtherParticipant = (conversation: any) => {
    const isEducator = userProfile.role === 'educator';
    return isEducator
      ? conversation.family_profiles
      : conversation.educator_profiles;
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              {/* Menu mobile (hamburger) */}
              <div className="md:hidden">
                {userProfile?.role === 'educator' ? (
                  <EducatorMobileMenu profile={userProfile} isPremium={isPremium} onLogout={handleLogout} />
                ) : (
                  <FamilyMobileMenu profile={userProfile} onLogout={handleLogout} />
                )}
              </div>
              {/* Logo */}
              <Link
                href={userProfile?.role === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                className="text-2xl font-bold text-primary-600"
              >
                Autisme Connect
              </Link>
            </div>
            {/* Menu desktop - caché sur mobile */}
            <div className="hidden md:flex space-x-4">
              <Link
                href={userProfile?.role === 'educator' ? '/dashboard/educator' : '/dashboard/family'}
                className="text-gray-700 hover:text-primary-600 px-3 py-2"
              >
                Mon tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Zone de messagerie */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-full bg-white rounded-lg shadow flex">
            {/* Liste des conversations */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
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
                    // Vérifier si l'autre personne est un éducateur ou une famille
                    const isOtherEducator = conv.educator_profiles?.id === other?.id;
                    const isOtherFamily = conv.family_profiles?.id === other?.id;
                    const profileUrl = isOtherEducator ? `/educator/${other?.id}` : (isOtherFamily ? `/family/${other?.id}` : null);

                    return (
                      <div
                        key={conv.id}
                        className={`w-full p-4 hover:bg-gray-50 border-b border-gray-100 ${
                          selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedConversation(conv)}
                            className="flex-shrink-0"
                          >
                            <Avatar participant={other} size="md" />
                          </button>
                          <div className="flex-1 min-w-0">
                            {profileUrl ? (
                              <Link href={profileUrl}>
                                <p className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer transition-colors">
                                  {other.first_name || 'Utilisateur'} {other.last_name || ''}
                                </p>
                              </Link>
                            ) : (
                              <button
                                onClick={() => setSelectedConversation(conv)}
                                className="font-medium text-gray-900 text-left"
                              >
                                {other.first_name || 'Utilisateur'} {other.last_name || ''}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedConversation(conv)}
                              className="text-sm text-gray-500 truncate text-left block w-full"
                            >
                              {other.location || 'Localisation non renseignée'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Zone de conversation */}
            <div className="flex-1 flex flex-col">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Sélectionnez une conversation
                </div>
              ) : (
                <>
                  {/* En-tête de la conversation */}
                  <div className="p-4 border-b border-gray-200">
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
                          {appointmentUrl && (
                            <Link
                              href={appointmentUrl}
                              className="hidden sm:inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {appointmentLabel}
                            </Link>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isSender = message.sender_id === currentUser?.id;
                      const other = getOtherParticipant(selectedConversation);
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Avatar pour les messages reçus */}
                          {!isSender && <Avatar participant={other} size="sm" />}

                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isSender
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p>{message.content}</p>
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
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Envoyer
                      </button>
                    </form>
                    {(() => {
                      const other = getOtherParticipant(selectedConversation);
                      const isOtherEducator = selectedConversation.educator_profiles?.id === other?.id;
                      const isOtherFamily = selectedConversation.family_profiles?.id === other?.id;
                      const appointmentUrl = isOtherEducator ? `/educator/${other?.id}/book-appointment` : (isOtherFamily ? `/family/${other?.id}/request-appointment` : null);
                      const appointmentLabel = isOtherEducator ? 'Demander un rendez-vous' : 'Proposer un rendez-vous';

                      return appointmentUrl ? (
                        <Link
                          href={appointmentUrl}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors text-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {appointmentLabel}
                        </Link>
                      ) : null;
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
