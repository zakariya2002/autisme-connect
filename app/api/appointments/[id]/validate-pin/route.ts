import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const { pinCode } = await request.json();

    console.log('🔐 Validation code PIN pour RDV:', appointmentId);
    console.log('📝 Code reçu:', pinCode);

    if (!pinCode || pinCode.length !== 4) {
      return NextResponse.json(
        { error: 'Code PIN invalide (4 chiffres requis)' },
        { status: 400 }
      );
    }

    // Récupérer le RDV
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error('❌ RDV introuvable:', appointmentError);
      return NextResponse.json(
        { error: 'Rendez-vous introuvable' },
        { status: 404 }
      );
    }

    // Vérifications de sécurité
    if (appointment.status !== 'confirmed') {
      console.error('❌ Statut invalide:', appointment.status);
      return NextResponse.json(
        {
          error: 'Ce rendez-vous ne peut pas être démarré',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Vérifier que le code n'est pas déjà validé
    if (appointment.pin_code_validated) {
      console.log('⚠️ Code déjà validé');
      return NextResponse.json(
        {
          error: 'Ce rendez-vous a déjà été démarré',
          code: 'ALREADY_VALIDATED'
        },
        { status: 400 }
      );
    }

    // Vérifier l'expiration du code
    const now = new Date();
    const expiresAt = new Date(appointment.pin_code_expires_at);

    if (now > expiresAt) {
      console.error('❌ Code expiré');
      return NextResponse.json(
        {
          error: 'Le code PIN a expiré',
          code: 'PIN_EXPIRED'
        },
        { status: 400 }
      );
    }

    // Vérifier si le code est verrouillé
    if (appointment.pin_locked_until) {
      const lockUntil = new Date(appointment.pin_locked_until);
      if (now < lockUntil) {
        const minutesLeft = Math.ceil((lockUntil.getTime() - now.getTime()) / 60000);
        console.error('❌ Code verrouillé');
        return NextResponse.json(
          {
            error: `Trop de tentatives. Réessayez dans ${minutesLeft} minute(s)`,
            code: 'TOO_MANY_ATTEMPTS',
            lockedUntil: lockUntil.toISOString()
          },
          { status: 429 }
        );
      }
    }

    // Valider le code PIN
    if (pinCode !== appointment.pin_code) {
      console.error('❌ Code incorrect');

      const newAttempts = (appointment.pin_code_attempts || 0) + 1;
      const attemptsLeft = 3 - newAttempts;

      // Update attempts
      const updateData: any = {
        pin_code_attempts: newAttempts
      };

      // Verrouiller après 3 tentatives
      if (newAttempts >= 3) {
        updateData.pin_locked_until = addMinutes(now, 10).toISOString();
        console.log('🔒 Code verrouillé pour 10 minutes');
      }

      await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      return NextResponse.json(
        {
          error: 'Code PIN incorrect',
          code: 'INVALID_PIN',
          attemptsLeft: Math.max(0, attemptsLeft)
        },
        { status: 400 }
      );
    }

    // ✅ CODE VALIDE - Démarrer le RDV
    console.log('✅ Code PIN validé !');

    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'in_progress',
        pin_code_validated: true,
        pin_code_entered_at: now.toISOString(),
        started_at: now.toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('❌ Erreur update:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors du démarrage du rendez-vous' },
        { status: 500 }
      );
    }

    // Notification à la famille (optionnel via websocket/pusher)
    // TODO: Implémenter notification temps réel

    console.log('🎉 RDV démarré avec succès');

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous démarré avec succès',
      appointment: {
        id: appointmentId,
        status: 'in_progress',
        started_at: now.toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur validation PIN:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la validation du code PIN' },
      { status: 500 }
    );
  }
}
