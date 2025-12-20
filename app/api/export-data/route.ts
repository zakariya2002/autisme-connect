import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Vérifier l'authentification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.user_metadata?.role;

    let exportData: any = {
      export_date: new Date().toISOString(),
      user_id: userId,
      email: session.user.email,
      role: userRole,
    };

    if (userRole === 'family') {
      // Export données famille
      const { data: familyProfile } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: children } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyProfile?.id);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, educator_profiles(first_name, last_name)')
        .eq('family_id', familyProfile?.id);

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('family_id', familyProfile?.id);

      const { data: messages } = await supabase
        .from('messages')
        .select('content, created_at, is_read')
        .eq('sender_id', userId);

      exportData = {
        ...exportData,
        profile: familyProfile,
        children: children || [],
        appointments: appointments || [],
        reviews: reviews || [],
        messages_sent: messages || [],
      };
    } else if (userRole === 'educator') {
      // Export données professionnel
      const { data: educatorProfile } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: certifications } = await supabase
        .from('certifications')
        .select('*')
        .eq('educator_id', educatorProfile?.id);

      const { data: availabilities } = await supabase
        .from('availabilities')
        .select('*')
        .eq('educator_id', educatorProfile?.id);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, family_profiles(first_name, last_name)')
        .eq('educator_id', educatorProfile?.id);

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('educator_id', educatorProfile?.id);

      const { data: messages } = await supabase
        .from('messages')
        .select('content, created_at, is_read')
        .eq('sender_id', userId);

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, plan_id, current_period_start, current_period_end')
        .eq('educator_id', educatorProfile?.id);

      exportData = {
        ...exportData,
        profile: educatorProfile,
        certifications: certifications || [],
        availabilities: availabilities || [],
        appointments: appointments || [],
        reviews_received: reviews || [],
        messages_sent: messages || [],
        subscriptions: subscriptions || [],
      };
    }

    // Retourner les données en JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="neuro-care-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Erreur export données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
