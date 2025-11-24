'use client';

import { useTnd } from '@/contexts/TndContext';
import HomePage from '@/app/page-normal';
import HomeTnd from '@/app/page-tnd';
import TndToggle from '@/components/TndToggle';

export default function HomePageWrapper() {
  const { tndMode } = useTnd();

  // Si mode TND activé, afficher la version simplifiée
  if (tndMode) {
    return (
      <>
        <HomeTnd />
        <TndToggle />
      </>
    );
  }

  // Sinon, afficher la version normale
  return (
    <>
      <HomePage />
      <TndToggle />
    </>
  );
}
