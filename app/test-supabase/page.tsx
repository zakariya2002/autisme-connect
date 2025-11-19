'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Vérification...');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    testSupabase();
  }, []);

  const testSupabase = async () => {
    try {
      // Test 1: Vérifier la connexion
      setStatus('Test de connexion Supabase...');

      // Test 2: Vérifier l'authentification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setStatus('❌ Erreur de session');
        setDetails({ error: sessionError.message });
        return;
      }

      // Test 3: Vérifier l'accès à la base de données
      const { data, error: dbError } = await supabase
        .from('educator_profiles')
        .select('count')
        .limit(1);

      if (dbError) {
        setStatus('❌ Erreur de connexion à la base de données');
        setDetails({
          error: dbError.message,
          hint: dbError.hint,
          details: dbError.details,
        });
        return;
      }

      setStatus('✅ Connexion Supabase OK !');
      setDetails({
        session: session ? 'Session active' : 'Pas de session',
        database: 'Accès BD OK',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        keyType: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'Publishable Key' : 'Anon Key',
      });

    } catch (err: any) {
      setStatus('❌ Erreur inattendue');
      setDetails({ error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de Connexion Supabase</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Statut :</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Détails :</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Variables d'environnement :</h3>
          <div className="text-sm text-blue-800">
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Non définie'}</p>
            <p>Publishable Key: {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? '✅ Définie' : '❌ Non définie'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
