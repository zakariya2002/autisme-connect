'use client';

import Link from 'next/link';

interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthPromptModal({ open, onClose }: AuthPromptModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(2, 126, 126, 0.1)' }}>
          <svg className="w-7 h-7" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Rejoignez la communauté
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Connectez-vous ou créez un compte pour interagir avec la communauté : réagir, commenter et publier.
        </p>
        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="flex-1 px-4 py-2.5 border-2 font-semibold rounded-xl text-sm transition-colors hover:bg-gray-50"
            style={{ borderColor: '#027e7e', color: '#027e7e' }}
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            className="flex-1 px-4 py-2.5 text-white font-semibold rounded-xl text-sm transition-colors hover:opacity-90"
            style={{ backgroundColor: '#027e7e' }}
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
