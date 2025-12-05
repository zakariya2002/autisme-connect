import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateFamilyReceiptPDF } from '@/lib/invoice-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    console.log('🔄 Début de la régénération des reçus famille...');

    // Récupérer tous les reçus famille existants
    const { data: receipts, error: receiptsError } = await supabase
      .from('invoices')
      .select(`
        *,
        appointment:appointments!appointment_id(
          *,
          educator:educator_profiles!educator_id(*),
          family:family_profiles!family_id(*)
        )
      `)
      .eq('type', 'family_receipt')
      .order('created_at', { ascending: false });

    if (receiptsError) {
      console.error('Erreur récupération reçus:', receiptsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des reçus' },
        { status: 500 }
      );
    }

    if (!receipts || receipts.length === 0) {
      return NextResponse.json({
        message: 'Aucun reçu à régénérer',
        count: 0
      });
    }

    console.log(`📋 ${receipts.length} reçus à régénérer`);

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Régénérer chaque reçu
    for (const receipt of receipts) {
      try {
        const appointment = receipt.appointment;

        if (!appointment || !appointment.educator || !appointment.family) {
          console.log(`⚠️  Reçu ${receipt.invoice_number}: données manquantes, ignoré`);
          errorCount++;
          errors.push({
            invoice_number: receipt.invoice_number,
            error: 'Données de rendez-vous manquantes'
          });
          continue;
        }

        // Récupérer les emails
        const { data: educatorUser } = await supabase.auth.admin.getUserById(
          appointment.educator.user_id
        );
        const { data: familyUser } = await supabase.auth.admin.getUserById(
          appointment.family.user_id
        );

        const educatorEmail = educatorUser?.user?.email || '';
        const familyEmail = familyUser?.user?.email || '';

        // Calculer la durée en minutes
        const startTime = new Date(`2000-01-01T${appointment.start_time}`);
        const endTime = new Date(`2000-01-01T${appointment.end_time}`);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        const appointmentDate = new Date(appointment.appointment_date);

        // Données pour le nouveau reçu
        const familyReceiptData = {
          invoiceNumber: receipt.invoice_number,
          invoiceDate: new Date(receipt.invoice_date),
          appointmentDate,
          duration,
          startTime: appointment.start_time,
          endTime: appointment.end_time,

          educatorName: `${appointment.educator.first_name} ${appointment.educator.last_name}`,
          educatorAddress: appointment.educator.location || '',
          educatorSiret: appointment.educator.siret || undefined,
          educatorSapNumber: appointment.educator.sap_number || undefined,
          educatorEmail,
          // Données de profession pour adapter les descriptions de service
          educatorProfession: appointment.educator.profession || 'educator',
          educatorProfessionLabel: appointment.educator.profession_label || 'Éducateur spécialisé',
          educatorRppsNumber: appointment.educator.rpps_number || undefined,

          familyName: `${appointment.family.first_name} ${appointment.family.last_name}`,
          familyAddress: appointment.family.location || '',

          amountTotal: receipt.amount_total,
          amountHT: receipt.amount_ht,
          amountTVA: receipt.amount_tva || 0,
          amountCommission: receipt.amount_commission || 0,
          amountNet: receipt.amount_net || 0,

          type: 'family_receipt' as const
        };

        // Générer le nouveau PDF
        const pdfBuffer = await generateFamilyReceiptPDF(familyReceiptData);

        // Upload vers Supabase Storage (écrase l'ancien)
        const filePath = receipt.pdf_storage_path || `invoices/families/${appointment.id}_${receipt.invoice_number}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true // Écraser l'ancien fichier
          });

        if (uploadError) {
          console.error(`❌ Erreur upload pour ${receipt.invoice_number}:`, uploadError);
          errorCount++;
          errors.push({
            invoice_number: receipt.invoice_number,
            error: uploadError.message
          });
          continue;
        }

        // Obtenir la nouvelle URL publique
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Mettre à jour l'enregistrement dans la base de données
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            pdf_url: urlData.publicUrl,
            pdf_storage_path: filePath,
            updated_at: new Date().toISOString()
          })
          .eq('id', receipt.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour DB pour ${receipt.invoice_number}:`, updateError);
          errorCount++;
          errors.push({
            invoice_number: receipt.invoice_number,
            error: updateError.message
          });
          continue;
        }

        console.log(`✅ Reçu ${receipt.invoice_number} régénéré avec succès`);
        successCount++;

      } catch (error: any) {
        console.error(`❌ Erreur pour le reçu ${receipt.invoice_number}:`, error);
        errorCount++;
        errors.push({
          invoice_number: receipt.invoice_number,
          error: error.message
        });
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: 'Régénération terminée',
      total: receipts.length,
      successCount,
      errorCount,
      errors: errorCount > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('❌ Erreur globale:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la régénération' },
      { status: 500 }
    );
  }
}
