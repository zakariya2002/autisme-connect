'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function VideoCallPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer pour la durée de l'appel
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isJoined && callStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - callStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isJoined, callStartTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const joinCall = useCallback(async () => {
    if (isCreatingRoom || roomUrl) return;

    setIsCreatingRoom(true);
    setError(null);

    try {
      // Créer la room via l'API
      const response = await fetch('/api/video/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: roomId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la room');
      }

      console.log('Room créée:', data.roomUrl);
      setRoomUrl(data.roomUrl);
      setIsJoined(true);
      setCallStartTime(new Date());

    } catch (err: any) {
      console.error('Erreur joinCall:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsCreatingRoom(false);
    }
  }, [roomId, isCreatingRoom, roomUrl]);

  const leaveCall = useCallback(() => {
    setIsJoined(false);
    setRoomUrl(null);
    setCallStartTime(null);
    setElapsedTime(0);
  }, []);

  const openInNewTab = useCallback(() => {
    if (roomUrl) {
      window.open(roomUrl, '_blank');
    }
  }, [roomUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-gray-800 font-semibold text-lg">
              Séance vidéo
            </h1>
            {isJoined && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  En direct
                </span>
                <span className="text-gray-600 text-sm font-mono">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isJoined && roomUrl && (
              <button
                onClick={openInNewTab}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 border border-gray-200"
                title="Ouvrir dans un nouvel onglet"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">Nouvel onglet</span>
              </button>
            )}

            {isJoined && (
              <button
                onClick={leaveCall}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
                Quitter
              </button>
            )}

            {!isJoined && (
              <button
                onClick={() => router.push('/dashboard/educator/appointments')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 border border-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Video Container */}
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto h-full">
          {!isJoined && !isCreatingRoom ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-xl border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Prêt pour la séance ?
                </h2>
                <p className="text-gray-500 mb-6">
                  Séance: <span className="font-mono text-violet-600 font-medium">{roomId.substring(0, 8)}...</span>
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={joinCall}
                  disabled={isCreatingRoom}
                  className="w-full py-3 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #a855f7 50%, #c084fc 75%, #e879f9 100%)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Rejoindre la séance
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-sm mb-3">Vérifiez avant de rejoindre :</p>
                  <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Caméra
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Micro
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connexion
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* État de chargement */}
          {isCreatingRoom && !isJoined && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-xl border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Préparation de la salle...
                </h2>
                <p className="text-gray-500">
                  Veuillez patienter quelques instants
                </p>
              </div>
            </div>
          )}

          {/* Iframe Daily.co */}
          {isJoined && roomUrl && (
            <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <iframe
                src={roomUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
                title="Séance vidéo Daily.co"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
