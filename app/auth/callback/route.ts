import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();

    // Créer la réponse de redirection par défaut
    let redirectUrl = '/auth/choose-role';
    const response = NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options as CookieOptions);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const role = data.user.user_metadata?.role;

      // Déterminer l'URL de redirection selon le rôle
      if (role === 'admin') {
        redirectUrl = '/admin';
      } else if (role === 'educator') {
        redirectUrl = '/dashboard/educator';
      } else if (role === 'family') {
        redirectUrl = '/dashboard/family';
      }

      // Retourner la réponse avec les cookies et la bonne redirection
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin), {
        headers: response.headers,
      });
    }

    // Log l'erreur pour debug
    if (error) {
      console.error('Supabase OAuth error:', error);
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  return NextResponse.redirect(new URL('/auth/login?error=oauth_error', requestUrl.origin));
}
