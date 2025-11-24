'use client';

import { useTnd } from '@/contexts/TndContext';

export default function TndToggle() {
  const { tndMode, toggleTndMode } = useTnd();

  return (
    <button
      onClick={toggleTndMode}
      className={`group fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 transition-all duration-300 hover:scale-105 active:scale-95 ${
        tndMode
          ? 'bg-blue-600 text-white shadow-xl px-4 py-3 md:px-7 md:py-5 rounded-xl md:rounded-2xl border-2 border-blue-700'
          : 'bg-white text-gray-700 shadow-lg hover:shadow-xl px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-300 hover:border-blue-400'
      }`}
      aria-label={tndMode ? 'Désactiver le mode simplifié' : 'Activer le mode simplifié'}
      title={tndMode ? 'Désactiver le mode simplifié' : 'Activer le mode simplifié pour personnes TND'}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className="transition-transform duration-200 group-hover:scale-110">
          <span className="text-lg md:text-2xl">♿</span>
        </div>

        <div className="text-left">
          <div className="font-bold text-xs md:text-base">
            Mode Simple
          </div>
          <div className={`text-[10px] md:text-xs font-medium ${tndMode ? 'text-blue-100' : 'text-gray-500'}`}>
            {tndMode ? 'Activé' : 'Désactivé'}
          </div>
        </div>
      </div>
    </button>
  );
}
