'use client';

import { useTnd } from '@/contexts/TndContext';

export default function TndToggle() {
  const { tndMode, toggleTndMode } = useTnd();

  return (
    <button
      onClick={toggleTndMode}
      className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300 ${
        tndMode
          ? 'bg-blue-600 text-white border-4 border-blue-800 px-8 py-6 rounded-3xl text-2xl font-bold'
          : 'bg-white text-gray-700 border-2 border-gray-300 px-6 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50'
      }`}
      aria-label={tndMode ? 'Désactiver le mode simplifié' : 'Activer le mode simplifié'}
      title={tndMode ? 'Désactiver le mode simplifié' : 'Activer le mode simplifié pour personnes TND'}
    >
      <div className="flex items-center gap-3">
        <span className={tndMode ? 'text-3xl' : 'text-2xl'}>♿</span>
        <div className="text-left">
          <div className={tndMode ? 'text-xl' : 'text-base'}>
            {tndMode ? 'Mode Simple' : 'Mode Simple'}
          </div>
          <div className={tndMode ? 'text-lg font-normal' : 'text-sm font-normal text-gray-500'}>
            {tndMode ? 'ACTIVÉ' : 'OFF'}
          </div>
        </div>
      </div>
    </button>
  );
}
