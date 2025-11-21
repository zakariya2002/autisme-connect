'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-700 hover:text-primary-600"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 p-6">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="mt-8 flex flex-col gap-4">
              <Link href="/search" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary-600 py-2 font-medium">
                Trouver un éducateur
              </Link>
              <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary-600 py-2 font-medium">
                Tarifs
              </Link>
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary-600 py-2 font-medium">
                Connexion
              </Link>
              <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium text-center">
                Inscription
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
