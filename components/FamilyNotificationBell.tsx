'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'message' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_rejected';
  title: string;
  description: string;
  link: string;
  time: string;
  read: boolean;
}

interface FamilyNotificationBellProps {
  familyId: string;
  userId: string;
}

export default function FamilyNotificationBell({ familyId, userId }: FamilyNotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Polling toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [familyId, userId]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const notifs: Notification[] = [];

      // 1. Messages non lus
      const { data: unreadMessages, error: msgError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          sender:sender_id(first_name, last_name)
        `)
        .eq('receiver_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!msgError && unreadMessages) {
        unreadMessages.forEach((msg: any) => {
          const senderName = msg.sender ?
            `${msg.sender.first_name || ''} ${msg.sender.last_name || ''}`.trim() :
            'Un professionnel';
          notifs.push({
            id: `msg-${msg.id}`,
            type: 'message',
            title: 'Nouveau message',
            description: `${senderName}: ${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}`,
            link: '/messages',
            time: formatTime(msg.created_at),
            read: false,
          });
        });
      }

      // 2. Rendez-vous confirmés récemment (dernières 48h)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const { data: confirmedAppointments, error: confirmError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          updated_at,
          educator:educator_profiles(first_name, last_name)
        `)
        .eq('family_id', familyId)
        .eq('status', 'confirmed')
        .gte('updated_at', twoDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(5);

      if (!confirmError && confirmedAppointments) {
        confirmedAppointments.forEach((apt: any) => {
          const educatorName = apt.educator ?
            `${apt.educator.first_name || ''} ${apt.educator.last_name || ''}`.trim() :
            'Un professionnel';
          const date = new Date(apt.appointment_date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
          });
          notifs.push({
            id: `apt-confirmed-${apt.id}`,
            type: 'appointment_confirmed',
            title: 'Rendez-vous confirmé',
            description: `${educatorName} - ${date} à ${apt.start_time?.substring(0, 5)}`,
            link: '/dashboard/family/appointments',
            time: formatTime(apt.updated_at),
            read: false,
          });
        });
      }

      // 3. Rendez-vous annulés récemment (dernières 48h)
      const { data: cancelledAppointments, error: cancelError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          updated_at,
          educator:educator_profiles(first_name, last_name)
        `)
        .eq('family_id', familyId)
        .eq('status', 'cancelled')
        .gte('updated_at', twoDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(5);

      if (!cancelError && cancelledAppointments) {
        cancelledAppointments.forEach((apt: any) => {
          const educatorName = apt.educator ?
            `${apt.educator.first_name || ''} ${apt.educator.last_name || ''}`.trim() :
            'Un professionnel';
          const date = new Date(apt.appointment_date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
          });
          notifs.push({
            id: `apt-cancelled-${apt.id}`,
            type: 'appointment_cancelled',
            title: 'Rendez-vous annulé',
            description: `${educatorName} - ${date} à ${apt.start_time?.substring(0, 5)}`,
            link: '/dashboard/family/appointments',
            time: formatTime(apt.updated_at),
            read: false,
          });
        });
      }

      // 4. Rendez-vous refusés récemment (dernières 48h)
      const { data: rejectedAppointments, error: rejectError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          updated_at,
          educator:educator_profiles(first_name, last_name)
        `)
        .eq('family_id', familyId)
        .eq('status', 'rejected')
        .gte('updated_at', twoDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(5);

      if (!rejectError && rejectedAppointments) {
        rejectedAppointments.forEach((apt: any) => {
          const educatorName = apt.educator ?
            `${apt.educator.first_name || ''} ${apt.educator.last_name || ''}`.trim() :
            'Un professionnel';
          const date = new Date(apt.appointment_date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
          });
          notifs.push({
            id: `apt-rejected-${apt.id}`,
            type: 'appointment_rejected',
            title: 'Rendez-vous non disponible',
            description: `${educatorName} - ${date}`,
            link: '/dashboard/family/appointments',
            time: formatTime(apt.updated_at),
            read: false,
          });
        });
      }

      // Trier par date (plus récent en premier)
      notifs.sort((a, b) => 0);

      setNotifications(notifs.slice(0, 10));
      setUnreadCount(notifs.length);
    } catch (error) {
      console.error('Erreur notifications famille:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'appointment_confirmed':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'appointment_cancelled':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'appointment_rejected':
        return (
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge nombre de notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white">
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-white/80">
              {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle'}
            </p>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Aucune notification</p>
                <p className="text-gray-400 text-xs mt-1">Vous êtes à jour !</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {getIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-500 truncate">{notif.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                    <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-2"></div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-2">
                <Link
                  href="/messages"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center text-sm text-violet-600 hover:text-violet-700 font-medium py-2 rounded-lg hover:bg-violet-50 transition"
                >
                  Messages
                </Link>
                <Link
                  href="/dashboard/family/appointments"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center text-sm text-violet-600 hover:text-violet-700 font-medium py-2 rounded-lg hover:bg-violet-50 transition"
                >
                  Rendez-vous
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
