import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Créer le dossier de sortie
const outputDir = '/home/zakariya/Bureau/factures_test';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Descriptions de service selon la profession
function getServiceDescription(profession) {
  const descriptions = {
    'educator': 'Séance d\'accompagnement éducatif spécialisé',
    'moniteur_educateur': 'Séance d\'accompagnement éducatif',
    'psychologist': 'Consultation psychologique',
    'psychomotricist': 'Séance de psychomotricité',
    'occupational_therapist': 'Séance d\'ergothérapie',
    'speech_therapist': 'Séance d\'orthophonie',
    'physiotherapist': 'Séance de kinésithérapie',
    'apa_teacher': 'Séance d\'activité physique adaptée',
    'music_therapist': 'Séance de musicothérapie',
  };
  return descriptions[profession] || 'Séance d\'accompagnement';
}

// Description pour le reçu famille (PCH/MDPH)
function getFamilyServiceDescription(profession) {
  const descriptions = {
    'educator': 'Accompagnement éducatif d\'une personne en situation de handicap',
    'moniteur_educateur': 'Accompagnement éducatif d\'une personne en situation de handicap',
    'psychologist': 'Accompagnement psychologique d\'une personne en situation de handicap',
    'psychomotricist': 'Rééducation psychomotrice d\'une personne en situation de handicap',
    'occupational_therapist': 'Rééducation ergothérapique d\'une personne en situation de handicap',
    'speech_therapist': 'Rééducation orthophonique d\'une personne en situation de handicap',
    'physiotherapist': 'Rééducation kinésithérapique d\'une personne en situation de handicap',
    'apa_teacher': 'Activité physique adaptée pour personne en situation de handicap',
    'music_therapist': 'Musicothérapie pour personne en situation de handicap',
  };
  return descriptions[profession] || 'Accompagnement d\'une personne en situation de handicap';
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatAmount(amountInCents) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amountInCents / 100);
}

// Professions à tester
const professions = [
  { code: 'educator', label: 'Éducateur spécialisé', name: 'Marie Dupont', hasRpps: false, hasSap: true },
  { code: 'psychologist', label: 'Psychologue', name: 'Dr. Jean Martin', hasRpps: true, hasSap: false },
  { code: 'apa_teacher', label: 'Enseignant APA', name: 'Lucas Bernard', hasRpps: false, hasSap: true },
  { code: 'psychomotricist', label: 'Psychomotricien', name: 'Sophie Leroy', hasRpps: true, hasSap: false },
  { code: 'speech_therapist', label: 'Orthophoniste', name: 'Dr. Claire Moreau', hasRpps: true, hasSap: false },
  { code: 'occupational_therapist', label: 'Ergothérapeute', name: 'Thomas Petit', hasRpps: true, hasSap: false },
  { code: 'physiotherapist', label: 'Kinésithérapeute', name: 'Dr. Pierre Durand', hasRpps: true, hasSap: false },
  { code: 'music_therapist', label: 'Musicothérapeute', name: 'Emma Blanc', hasRpps: false, hasSap: true },
  { code: 'moniteur_educateur', label: 'Moniteur éducateur', name: 'Nicolas Roux', hasRpps: false, hasSap: true },
];

async function generateEducatorInvoicePDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Couleurs
      const primaryColor = '#027e7e'; // Teal NeuroCare
      const grayColor = '#6b7280';
      const darkColor = '#1f2937';

      // ----- HEADER -----
      doc
        .fontSize(26)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('FACTURE', 50, 50, { align: 'left' });

      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica')
        .text(`N° ${data.invoiceNumber}`, 50, 85)
        .text(`Date d'émission : ${formatDate(data.invoiceDate)}`, 50, 100);

      // Logo / Nom plateforme (aligné à droite)
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('Émise via', 400, 50, { width: 145, align: 'right' })
        .fontSize(16)
        .fillColor('#027e7e')
        .font('Helvetica-Bold')
        .text('NeuroCare', 400, 65, { width: 145, align: 'right' })
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('www.neuro-care.fr', 400, 85, { width: 145, align: 'right' });

      // Ligne séparatrice
      doc
        .strokeColor('#d1d5db')
        .lineWidth(1)
        .moveTo(50, 130)
        .lineTo(545, 130)
        .stroke();

      // ----- INFORMATIONS PRESTATAIRE -----
      let y = 160;
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .font('Helvetica-Bold')
        .text('PRESTATAIRE', 50, y);

      y += 18;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(darkColor)
        .text(data.educatorName, 50, y);

      y += 16;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(grayColor)
        .text(data.educatorProfessionLabel, 50, y);

      y += 14;
      if (data.educatorAddress) {
        doc.fillColor(darkColor).text(data.educatorAddress, 50, y);
        y += 14;
      }

      if (data.educatorSiret) {
        doc
          .fillColor(darkColor)
          .font('Helvetica-Bold')
          .text(`SIRET : ${data.educatorSiret}`, 50, y);
        y += 14;
      }

      if (data.educatorRppsNumber) {
        doc
          .fillColor('#7c3aed')
          .font('Helvetica-Bold')
          .text(`N° RPPS : ${data.educatorRppsNumber}`, 50, y);
        y += 14;
      }

      if (data.educatorSapNumber) {
        doc
          .fillColor('#2563eb')
          .font('Helvetica-Bold')
          .text(`N° SAP : ${data.educatorSapNumber}`, 50, y);
        y += 14;
      }

      doc
        .font('Helvetica')
        .fillColor(grayColor)
        .text(`Email : ${data.educatorEmail}`, 50, y);

      // ----- INFORMATIONS CLIENT -----
      y = 160;
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .font('Helvetica-Bold')
        .text('CLIENT', 350, y);

      y += 18;
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(darkColor)
        .text(data.familyName, 350, y);

      y += 16;
      if (data.familyAddress) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(data.familyAddress, 350, y);
      }

      // ----- DÉTAILS DE LA PRESTATION -----
      y = 300;
      doc
        .strokeColor('#d1d5db')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(545, y)
        .stroke();

      y += 25;
      doc
        .fontSize(12)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('DÉTAIL DE LA PRESTATION', 50, y);

      y += 35;

      // Header tableau
      doc
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 50, y)
        .text('DATE', 280, y)
        .text('DURÉE', 380, y)
        .text('MONTANT', 480, y, { align: 'right', width: 65 });

      y += 18;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .moveTo(50, y)
        .lineTo(545, y)
        .stroke();

      y += 18;

      const serviceDescription = getServiceDescription(data.educatorProfession);
      doc
        .fontSize(10)
        .fillColor(darkColor)
        .font('Helvetica')
        .text(serviceDescription, 50, y)
        .text(formatDate(data.appointmentDate), 280, y)
        .text(formatDuration(data.duration), 380, y)
        .text(formatAmount(data.amountTotal), 480, y, { align: 'right', width: 65 });

      // ----- MONTANTS -----
      y += 60;
      doc
        .strokeColor('#d1d5db')
        .lineWidth(0.5)
        .moveTo(320, y)
        .lineTo(545, y)
        .stroke();

      y += 20;

      doc
        .fontSize(10)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('Montant total de la prestation', 320, y)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text(formatAmount(data.amountTotal), 480, y, { align: 'right', width: 65 });

      y += 22;

      doc
        .fontSize(8)
        .fillColor(grayColor)
        .font('Helvetica-Oblique')
        .text('TVA non applicable, art. 293 B du CGI', 320, y, { width: 220 });

      y += 25;

      doc
        .fontSize(10)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('Commission plateforme (12%)', 320, y)
        .fillColor('#dc2626')
        .font('Helvetica')
        .text(`- ${formatAmount(data.amountCommission)}`, 480, y, { align: 'right', width: 65 });

      y += 8;
      doc
        .fontSize(7)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('(incluant frais de paiement)', 320, y);

      y += 20;

      doc
        .strokeColor(primaryColor)
        .lineWidth(1.5)
        .moveTo(320, y)
        .lineTo(545, y)
        .stroke();

      y += 18;

      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('NET À PERCEVOIR', 320, y)
        .fontSize(14)
        .text(formatAmount(data.amountNet), 480, y, { align: 'right', width: 65 });

      y += 10;
      doc
        .fontSize(7)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('Virement sous 48h ouvrées', 320, y);

      // ----- MENTIONS LÉGALES -----
      y = 640;
      doc
        .rect(50, y, 495, 120)
        .fillAndStroke('#f9fafb', '#e5e7eb');

      y += 15;
      doc
        .fontSize(9)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('MENTIONS LÉGALES OBLIGATOIRES', 60, y);

      y += 20;
      doc
        .fontSize(8)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('Conditions de paiement :', 60, y);

      y += 12;
      doc
        .font('Helvetica')
        .text('Paiement effectué par carte bancaire via la plateforme NeuroCare (Stripe).', 60, y, { width: 475 });

      y += 18;
      doc
        .font('Helvetica-Bold')
        .text('Pénalités de retard :', 60, y);

      y += 12;
      doc
        .font('Helvetica')
        .text('En cas de retard de paiement, application de pénalités au taux légal de 10% majoré de 10 points de pourcentage,', 60, y, { width: 475 });

      y += 10;
      doc.text('ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40 €.', 60, y, { width: 475 });

      y += 18;
      doc
        .font('Helvetica-Bold')
        .text('Escompte :', 60, y);

      doc
        .font('Helvetica')
        .text('Aucun escompte accordé en cas de paiement anticipé.', 180, y, { width: 355 });

      // Footer
      doc
        .fontSize(7)
        .fillColor(grayColor)
        .font('Helvetica-Oblique')
        .text('Document généré automatiquement par la plateforme NeuroCare', 50, 780, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function generateFamilyReceiptPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#10b981';
      const grayColor = '#6b7280';
      const darkColor = '#1f2937';
      const blueColor = '#3b82f6';
      const tealColor = '#027e7e';

      // ----- HEADER -----
      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('ATTESTATION DE PAIEMENT', 50, 50, { align: 'left' });

      doc
        .fontSize(11)
        .fillColor(darkColor)
        .text('SERVICES À LA PERSONNE', 50, 72, { align: 'left' });

      doc
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica')
        .text(`N° ${data.invoiceNumber}`, 50, 92)
        .text(`Date d'émission: ${formatDate(data.invoiceDate)}`, 50, 105);

      // Logo (aligné à droite)
      doc
        .fontSize(16)
        .fillColor(tealColor)
        .font('Helvetica-Bold')
        .text('NeuroCare', 400, 50, { width: 150, align: 'right' })
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica')
        .text('www.neuro-care.fr', 400, 70, { width: 150, align: 'right' });

      // Ligne séparatrice
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, 130)
        .lineTo(550, 130)
        .stroke();

      // ----- BÉNÉFICIAIRE -----
      let y = 155;
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
      y = 155;
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('PRESTATAIRE DE SERVICES', 320, y);

      y += 20;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(darkColor)
        .text(data.educatorName, 320, y);

      y += 15;
      doc
        .fontSize(9)
        .fillColor(grayColor)
        .text(data.educatorProfessionLabel, 320, y);

      y += 15;
      if (data.educatorAddress) {
        doc.fillColor(darkColor).text(data.educatorAddress, 320, y);
        y += 15;
      }

      if (data.educatorSiret) {
        doc.text(`SIRET: ${data.educatorSiret}`, 320, y);
        y += 12;
      }

      if (data.educatorSapNumber) {
        doc
          .fillColor(blueColor)
          .font('Helvetica-Bold')
          .text(`N° SAP: ${data.educatorSapNumber}`, 320, y);
        y += 12;
        doc
          .fontSize(8)
          .fillColor(grayColor)
          .font('Helvetica')
          .text('Agréé Services à la Personne', 320, y);
        y += 12;
      }

      if (data.educatorRppsNumber) {
        doc
          .fontSize(9)
          .fillColor('#7c3aed')
          .font('Helvetica-Bold')
          .text(`N° RPPS: ${data.educatorRppsNumber}`, 320, y);
        y += 12;
        doc
          .fontSize(8)
          .fillColor(grayColor)
          .font('Helvetica')
          .text('Professionnel de santé enregistré', 320, y);
      }

      // ----- NATURE DU SERVICE -----
      y = 285;
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

      y += 25;

      doc
        .rect(50, y, 500, 45)
        .fillAndStroke('#eff6ff', '#3b82f6');

      y += 12;
      doc
        .fontSize(9)
        .fillColor(blueColor)
        .font('Helvetica-Bold')
        .text('Nature du service:', 60, y);

      y += 14;
      const familyServiceDescription = getFamilyServiceDescription(data.educatorProfession);
      doc
        .fontSize(10)
        .fillColor(darkColor)
        .font('Helvetica')
        .text(familyServiceDescription, 60, y);

      // ----- DÉTAILS HORAIRES -----
      y += 40;

      doc
        .fontSize(9)
        .fillColor(grayColor)
        .font('Helvetica-Bold')
        .text('DATE', 50, y)
        .text('HEURE DÉBUT', 150, y)
        .text('HEURE FIN', 250, y)
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
        .text(formatDate(data.appointmentDate), 50, y)
        .text(data.startTime, 150, y)
        .text(data.endTime, 250, y)
        .text(formatDuration(data.duration), 350, y)
        .text(formatAmount(data.amountTotal), 450, y, { align: 'right', width: 100 });

      // ----- TOTAL -----
      y += 40;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .moveTo(350, y)
        .lineTo(550, y)
        .stroke();

      y += 15;

      doc
        .fontSize(13)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('TOTAL PAYÉ', 350, y)
        .text(formatAmount(data.amountTotal), 450, y, { align: 'right', width: 100 });

      // ----- CONFIRMATION PAIEMENT -----
      y += 35;

      doc
        .rect(50, y, 500, 70)
        .fillAndStroke('#f0fdf4', '#10b981');

      y += 15;
      doc
        .fontSize(11)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('✓ PAIEMENT CONFIRMÉ', 70, y);

      y += 18;
      doc
        .fontSize(9)
        .fillColor(darkColor)
        .font('Helvetica')
        .text(`Paiement effectué le ${formatDate(data.invoiceDate)} par carte bancaire`, 70, y);

      y += 14;
      doc
        .fontSize(8)
        .fillColor(grayColor)
        .text('Transaction sécurisée via Stripe', 70, y);

      // ----- ENCADRÉ FISCAL -----
      y += 50;

      if (data.educatorSapNumber) {
        doc
          .rect(50, y, 500, 65)
          .fillAndStroke('#fefce8', '#eab308');

        y += 14;
        doc
          .fontSize(10)
          .fillColor('#854d0e')
          .font('Helvetica-Bold')
          .text('⭐ CRÉDIT D\'IMPÔT 50%', 70, y);

        y += 16;
        doc
          .fontSize(8)
          .fillColor(darkColor)
          .font('Helvetica')
          .text('Cette prestation est éligible au crédit d\'impôt de 50% au titre des Services à la Personne', 70, y, { width: 460 });

        y += 12;
        doc
          .fontSize(7)
          .fillColor(grayColor)
          .text('(Article 199 sexdecies du Code Général des Impôts)', 70, y);

        y += 30;
      } else {
        y += 10;
      }

      // ----- COMPATIBILITÉ AIDES -----
      doc
        .rect(50, y, 500, 55)
        .fillAndStroke('#f0f9ff', '#0ea5e9');

      y += 12;
      doc
        .fontSize(9)
        .fillColor('#0c4a6e')
        .font('Helvetica-Bold')
        .text('✓ ATTESTATION VALABLE POUR', 70, y);

      y += 14;
      doc
        .fontSize(8)
        .fillColor(darkColor)
        .font('Helvetica')
        .text('• Remboursement CESU préfinancé par votre employeur ou organisme', 70, y);

      y += 11;
      doc.text('• Demande de remboursement PCH (MDPH) ou AEEH (CAF)', 70, y);

      y += 11;
      doc.text('• Justificatif pour mutuelle complémentaire santé', 70, y);

      // ----- FOOTER -----
      y += 40;
      doc
        .fontSize(7)
        .fillColor(grayColor)
        .text('Cette attestation certifie le paiement de la prestation de Services à la Personne décrite ci-dessus.', 50, y, { align: 'center', width: 500 });

      y += 10;
      doc.text('Conservez ce document pour vos démarches administratives et fiscales.', 50, y, { align: 'center', width: 500 });

      y += 10;
      doc.text('Contact: contact@neuro-care.fr | www.neuro-care.fr', 50, y, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function generateAllTestInvoices() {
  console.log('Génération des factures test...\n');

  for (const prof of professions) {
    const baseData = {
      invoiceNumber: `FACT-TEST-${prof.code.toUpperCase().slice(0, 4)}-001`,
      invoiceDate: new Date(),
      appointmentDate: new Date('2025-01-15'),
      duration: 60,
      startTime: '14:00',
      endTime: '15:00',

      educatorName: prof.name,
      educatorAddress: '15 rue de la Santé, 75013 Paris',
      educatorSiret: '123 456 789 00012',
      educatorEmail: `${prof.name.toLowerCase().replace(/[^a-z]/g, '.')}@email.com`,
      educatorProfession: prof.code,
      educatorProfessionLabel: prof.label,
      educatorSapNumber: prof.hasSap ? 'SAP123456789' : undefined,
      educatorRppsNumber: prof.hasRpps ? '10123456789' : undefined,

      familyName: 'Famille Martin',
      familyAddress: '25 avenue des Fleurs, 75015 Paris',

      amountTotal: 6000,
      amountHT: 6000,
      amountTVA: 0,
      amountCommission: 720,
      amountNet: 5280,

      type: 'educator_invoice'
    };

    // Générer la facture éducateur
    const educatorPDF = await generateEducatorInvoicePDF(baseData);
    const educatorFilename = `Facture_${prof.label.replace(/\s/g, '_')}.pdf`;
    fs.writeFileSync(path.join(outputDir, educatorFilename), educatorPDF);
    console.log(`✓ ${educatorFilename}`);

    // Générer le reçu famille
    const familyPDF = await generateFamilyReceiptPDF({ ...baseData, invoiceNumber: `RECU-TEST-${prof.code.toUpperCase().slice(0, 4)}-001` });
    const familyFilename = `Recu_Famille_${prof.label.replace(/\s/g, '_')}.pdf`;
    fs.writeFileSync(path.join(outputDir, familyFilename), familyPDF);
    console.log(`✓ ${familyFilename}`);

    console.log('');
  }

  console.log(`\n✅ Toutes les factures ont été générées dans: ${outputDir}`);
  console.log('\nOuvrez le dossier avec: xdg-open ' + outputDir);
}

generateAllTestInvoices().catch(console.error);
