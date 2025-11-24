import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  appointmentDate: Date;
  duration: number; // en minutes

  // Éducateur
  educatorName: string;
  educatorAddress: string;
  educatorSiret?: string;
  educatorEmail: string;

  // Famille (client)
  familyName: string;
  familyAddress: string;

  // Montants (en centimes)
  amountTotal: number;
  amountHT: number;
  amountTVA: number;
  amountCommission: number;
  amountNet: number;

  // Type
  type: 'educator_invoice' | 'family_receipt';
}

export async function generateEducatorInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Couleurs
      const primaryColor = '#2563eb';
      const grayColor = '#6b7280';
      const darkColor = '#1f2937';

      // ----- HEADER -----
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text('FACTURE', 50, 50, { align: 'left' });

      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text(`N° ${data.invoiceNumber}`, 50, 80)
        .text(`Date: ${formatDate(data.invoiceDate)}`, 50, 95);

      // Logo / Nom plateforme
      doc
        .fontSize(16)
        .fillColor(primaryColor)
        .text('Autisme Connect', 400, 50, { align: 'right' })
        .fontSize(9)
        .fillColor(grayColor)
        .text('Plateforme de mise en relation', 400, 70, { align: 'right' })
        .text('www.autismeconnect.fr', 400, 85, { align: 'right' });

      // Ligne séparatrice
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, 120)
        .lineTo(550, 120)
        .stroke();

      // ----- INFORMATIONS PRESTATAIRE (Éducateur) -----
      let y = 150;
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('PRESTATAIRE', 50, y);

      y += 20;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(darkColor)
        .text(data.educatorName, 50, y);

      y += 15;
      if (data.educatorAddress) {
        doc.text(data.educatorAddress, 50, y);
        y += 15;
      }

      if (data.educatorSiret) {
        doc
          .fillColor(grayColor)
          .text(`SIRET: ${data.educatorSiret}`, 50, y);
        y += 15;
      }

      doc
        .fillColor(grayColor)
        .text(`Email: ${data.educatorEmail}`, 50, y);

      // ----- INFORMATIONS CLIENT (Famille) -----
      y = 150;
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('CLIENT', 350, y);

      y += 20;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(darkColor)
        .text(data.familyName, 350, y);

      y += 15;
      if (data.familyAddress) {
        doc.text(data.familyAddress, 350, y);
        y += 15;
      }

      // ----- DÉTAILS DE LA PRESTATION -----
      y = 280;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();

      y += 20;
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('DÉTAIL DE LA PRESTATION', 50, y);

      y += 30;

      // Header tableau
      doc
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 50, y)
        .text('DATE', 250, y)
        .text('DURÉE', 350, y)
        .text('MONTANT HT', 450, y, { align: 'right', width: 100 });

      y += 5;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();

      y += 15;

      // Ligne de prestation
      doc
        .fontSize(10)
        .fillColor(darkColor)
        .font('Helvetica')
        .text('Séance d\'accompagnement éducatif', 50, y)
        .text(formatDate(data.appointmentDate), 250, y)
        .text(`${data.duration} min`, 350, y)
        .text(formatAmount(data.amountHT), 450, y, { align: 'right', width: 100 });

      // ----- TOTAUX -----
      y += 50;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .moveTo(350, y)
        .lineTo(550, y)
        .stroke();

      y += 15;

      // Total HT
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('Total HT', 350, y)
        .fillColor(darkColor)
        .text(formatAmount(data.amountHT), 450, y, { align: 'right', width: 100 });

      y += 20;

      // TVA
      if (data.amountTVA > 0) {
        doc
          .fillColor(grayColor)
          .text('TVA (20%)', 350, y)
          .fillColor(darkColor)
          .text(formatAmount(data.amountTVA), 450, y, { align: 'right', width: 100 });
        y += 20;
      } else {
        doc
          .fontSize(9)
          .fillColor(grayColor)
          .text('TVA non applicable - Art. 293 B du CGI', 350, y, { width: 200 });
        y += 25;
      }

      // Total TTC
      doc
        .fontSize(12)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('Total TTC', 350, y)
        .text(formatAmount(data.amountTotal), 450, y, { align: 'right', width: 100 });

      y += 30;

      // Commission plateforme
      doc
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('Commission plateforme (10%)', 350, y)
        .text(`- ${formatAmount(data.amountCommission)}`, 450, y, { align: 'right', width: 100 });

      y += 15;

      // Net à percevoir
      doc
        .fontSize(11)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Net à percevoir', 350, y)
        .text(formatAmount(data.amountNet), 450, y, { align: 'right', width: 100 });

      // ----- MENTIONS LÉGALES -----
      y = 700;
      doc
        .fontSize(8)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('MENTIONS LÉGALES', 50, y, { underline: true });

      y += 15;
      doc
        .fontSize(7)
        .text('Cette facture est conforme aux exigences de l\'URSSAF pour les auto-entrepreneurs.', 50, y, { width: 500 });

      y += 12;
      doc.text('Paiement effectué via la plateforme Autisme Connect (Stripe).', 50, y, { width: 500 });

      y += 12;
      doc.text('En cas de retard de paiement, seront exigibles des pénalités de retard calculées sur la base du taux', 50, y, { width: 500 });

      y += 10;
      doc.text('appliqué par la Banque Centrale Européenne à son opération de refinancement la plus récente', 50, y, { width: 500 });

      y += 10;
      doc.text('majoré de 10 points de pourcentage, ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40 €.', 50, y, { width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateFamilyReceiptPDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#10b981';
      const grayColor = '#6b7280';
      const darkColor = '#1f2937';

      // ----- HEADER -----
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text('REÇU DE PAIEMENT', 50, 50, { align: 'left' });

      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text(`N° ${data.invoiceNumber}`, 50, 80)
        .text(`Date: ${formatDate(data.invoiceDate)}`, 50, 95);

      // Logo
      doc
        .fontSize(16)
        .fillColor(primaryColor)
        .text('Autisme Connect', 400, 50, { align: 'right' })
        .fontSize(9)
        .fillColor(grayColor)
        .text('www.autismeconnect.fr', 400, 70, { align: 'right' });

      // Ligne
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, 120)
        .lineTo(550, 120)
        .stroke();

      // ----- CLIENT -----
      let y = 150;
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('BÉNÉFICIAIRE', 50, y);

      y += 20;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(darkColor)
        .text(data.familyName, 50, y);

      y += 15;
      if (data.familyAddress) {
        doc.text(data.familyAddress, 50, y);
      }

      // ----- PRESTATAIRE -----
      y = 150;
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('PRESTATAIRE', 350, y);

      y += 20;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(darkColor)
        .text(data.educatorName, 350, y);

      y += 15;
      if (data.educatorAddress) {
        doc.text(data.educatorAddress, 350, y);
      }

      // ----- DÉTAILS -----
      y = 280;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();

      y += 20;
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('DÉTAIL DU PAIEMENT', 50, y);

      y += 30;

      // Header
      doc
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 50, y)
        .text('DATE', 250, y)
        .text('DURÉE', 350, y)
        .text('MONTANT', 450, y, { align: 'right', width: 100 });

      y += 5;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();

      y += 15;

      doc
        .fontSize(10)
        .fillColor(darkColor)
        .font('Helvetica')
        .text('Séance d\'accompagnement éducatif', 50, y)
        .text(formatDate(data.appointmentDate), 250, y)
        .text(`${data.duration} min`, 350, y)
        .text(formatAmount(data.amountTotal), 450, y, { align: 'right', width: 100 });

      // ----- TOTAL -----
      y += 50;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .moveTo(350, y)
        .lineTo(550, y)
        .stroke();

      y += 15;

      doc
        .fontSize(12)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('TOTAL PAYÉ', 350, y)
        .text(formatAmount(data.amountTotal), 450, y, { align: 'right', width: 100 });

      y += 40;

      // Encadré de confirmation
      doc
        .rect(50, y, 500, 80)
        .fillAndStroke('#f0fdf4', '#10b981');

      y += 20;
      doc
        .fontSize(10)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('✓ PAIEMENT CONFIRMÉ', 70, y);

      y += 20;
      doc
        .fontSize(9)
        .fillColor(darkColor)
        .font('Helvetica')
        .text(`Paiement effectué le ${formatDate(data.invoiceDate)} par carte bancaire`, 70, y);

      y += 15;
      doc
        .fillColor(grayColor)
        .text('Transaction sécurisée via Stripe', 70, y);

      // ----- FOOTER -----
      y = 720;
      doc
        .fontSize(8)
        .fillColor(grayColor)
        .text('Ce reçu atteste du paiement pour la prestation décrite ci-dessus.', 50, y, { align: 'center', width: 500 });

      y += 12;
      doc.text('Pour toute question: contact@autismeconnect.fr', 50, y, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatAmount(amountInCents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amountInCents / 100);
}
