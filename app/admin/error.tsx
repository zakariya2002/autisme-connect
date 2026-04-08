'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/admin/ui';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-admin-text-dark mb-4">
          Une erreur est survenue
        </h2>
        <p className="text-gray-600 dark:text-admin-muted-dark mb-6">
          Impossible de charger le panneau d&apos;administration. Veuillez réessayer.
        </p>
        <Button variant="primary" onClick={reset}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}
