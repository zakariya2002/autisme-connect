'use client';

import { useEffect } from 'react';

export default function ProTheme() {
  useEffect(() => {
    document.documentElement.classList.add('pro-theme');
    return () => {
      document.documentElement.classList.remove('pro-theme');
    };
  }, []);

  return null;
}
