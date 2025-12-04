'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirection vers la nouvelle page de tarifs professionnels
export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pro/pricing');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Redirection vers les tarifs...</p>
      </div>
    </div>
  );
}
