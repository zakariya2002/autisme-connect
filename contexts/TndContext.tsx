'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TndContextType {
  tndMode: boolean;
  toggleTndMode: () => void;
}

const TndContext = createContext<TndContextType | undefined>(undefined);

export function TndProvider({ children }: { children: ReactNode }) {
  const [tndMode, setTndMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Charger la préférence depuis localStorage au montage
  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('tnd-mode');
    if (savedMode === 'true') {
      setTndMode(true);
    }
  }, []);

  // Sauvegarder la préférence dans localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tnd-mode', String(tndMode));
    }
  }, [tndMode, mounted]);

  const toggleTndMode = () => {
    setTndMode(prev => !prev);
  };

  // Éviter le flash pendant l'hydratation
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <TndContext.Provider value={{ tndMode, toggleTndMode }}>
      {children}
    </TndContext.Provider>
  );
}

export function useTnd() {
  const context = useContext(TndContext);
  if (context === undefined) {
    throw new Error('useTnd must be used within a TndProvider');
  }
  return context;
}
