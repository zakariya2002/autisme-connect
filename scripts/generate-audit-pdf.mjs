import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const doc = new PDFDocument({
  size: 'A4',
  margin: 50,
  info: {
    Title: 'Audit Complet NeuroCare - Mars 2026',
    Author: 'Claude Code',
    Subject: 'Audit technique et strategique'
  }
});

const outputPath = path.join(process.cwd(), 'audit-neurocare-2026.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Colors
const PRIMARY = '#6B21A8';
const DARK = '#1E1E1E';
const GRAY = '#555555';
const LIGHT_BG = '#F3F0FF';
const GREEN = '#16A34A';
const ORANGE = '#EA580C';
const RED = '#DC2626';

// Helper functions
function title(text) {
  doc.moveDown(0.5);
  doc.fontSize(22).fillColor(PRIMARY).font('Helvetica-Bold').text(text);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(PRIMARY).lineWidth(2).stroke();
  doc.moveDown(0.5);
}

function subtitle(text) {
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor(PRIMARY).font('Helvetica-Bold').text(text);
  doc.moveDown(0.3);
}

function body(text) {
  doc.fontSize(10).fillColor(DARK).font('Helvetica').text(text, { lineGap: 3 });
}

function bold(text) {
  doc.fontSize(10).fillColor(DARK).font('Helvetica-Bold').text(text, { lineGap: 3 });
}

function bullet(text, indent = 15) {
  doc.fontSize(10).fillColor(DARK).font('Helvetica').text(`  •  ${text}`, 50 + indent, doc.y, { lineGap: 3, width: 480 - indent });
}

function tableRow(col1, col2, isBold = false) {
  const y = doc.y;
  const font = isBold ? 'Helvetica-Bold' : 'Helvetica';
  const color = isBold ? PRIMARY : DARK;
  doc.fontSize(10).font(font).fillColor(color).text(col1, 60, y, { width: 200 });
  doc.fontSize(10).font('Helvetica').fillColor(DARK).text(col2, 260, y, { width: 270 });
  doc.moveDown(0.3);
}

function checkPage(needed = 100) {
  if (doc.y > 750 - needed) {
    doc.addPage();
  }
}

// ============ PAGE 1 - COVER ============
doc.moveDown(6);
doc.fontSize(36).fillColor(PRIMARY).font('Helvetica-Bold').text('AUDIT COMPLET', { align: 'center' });
doc.fontSize(36).fillColor(PRIMARY).font('Helvetica-Bold').text('NEUROCARE', { align: 'center' });
doc.moveDown(1);
doc.fontSize(16).fillColor(GRAY).font('Helvetica').text('Plateforme autisme-connect', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(12).fillColor(GRAY).font('Helvetica').text('Audit technique, fonctionnel et strategique', { align: 'center' });
doc.moveDown(2);
doc.moveTo(150, doc.y).lineTo(450, doc.y).strokeColor(PRIMARY).lineWidth(1).stroke();
doc.moveDown(2);
doc.fontSize(12).fillColor(DARK).font('Helvetica').text('Date : 30 mars 2026', { align: 'center' });
doc.fontSize(12).fillColor(DARK).font('Helvetica').text('Genere par : Claude Code (Opus 4.6)', { align: 'center' });

// ============ PAGE 2 - COMPREHENSION ============
doc.addPage();
title('1. Comprehension de la plateforme');

body('NeuroCare est une marketplace specialisee dans l\'autisme et le neurodeveloppement en France.');
doc.moveDown(0.5);

subtitle('Le probleme resolu');
body('Les familles d\'enfants avec TSA/TDAH/DYS ont des difficultes a trouver des professionnels qualifies et verifies. Le parcours administratif (MDPH, aides financieres, recherche de pros) est complexe et chronophage.');
doc.moveDown(0.5);

subtitle('La solution NeuroCare');
bullet('Mise en relation familles et professionnels verifies (diplomes, RPPS, DREETS)');
bullet('Simplification du parcours : assistant MDPH, simulateur d\'aides, annuaire 6 000+ lieux TND');
bullet('Securisation des echanges : paiement Stripe, visio integree, PIN de session, facturation auto');
bullet('Accompagnement dans la duree : PPA avec suivi des progres, profils enfants, historique');
doc.moveDown(0.5);

subtitle('Modele economique');
bullet('Gratuit pour les familles (recherche, messagerie, outils)');
bullet('Commission de 12% sur chaque RDV paye');
bullet('L\'educateur conserve 88% du montant');
bullet('Modele d\'abonnement deprecie, passage au modele commission');
doc.moveDown(0.5);

subtitle('Positionnement');
body('NeuroCare se positionne comme une plateforme healthtech sociale, au-dela d\'un simple annuaire. L\'assistant MDPH, le PPA et l\'annuaire TND constituent les differenciateurs cles face a la concurrence.');

// ============ PAGE 3 - CHIFFRES CLES ============
doc.addPage();
title('2. Chiffres cles');

doc.moveDown(0.3);
const metrics = [
  ['Pages / routes', '153+'],
  ['Endpoints API', '45+'],
  ['Composants React', '48'],
  ['Tables base de donnees', '18+'],
  ['Fichiers utilitaires (lib)', '31'],
  ['Scripts', '24'],
  ['Structures TND referencees', '6 000+'],
  ['Professions supportees', '10'],
  ['Templates email', '8'],
  ['Fichiers de documentation', '15'],
];

tableRow('METRIQUE', 'VALEUR', true);
doc.moveTo(60, doc.y).lineTo(530, doc.y).strokeColor(GRAY).lineWidth(0.5).stroke();
doc.moveDown(0.3);
metrics.forEach(([k, v]) => tableRow(k, v));

doc.moveDown(1);
title('3. Stack technique');

const stack = [
  ['Frontend', 'Next.js 14 (App Router), React 18, Tailwind CSS'],
  ['Backend', 'Supabase (Auth + DB + Storage), API Routes Next.js'],
  ['Langage', 'TypeScript 5 (strict mode)'],
  ['Paiement', 'Stripe + Stripe Connect'],
  ['Video', 'Daily.co (visioconference)'],
  ['Email', 'Resend (transactionnel)'],
  ['OCR / IA', 'Tesseract.js + Claude API (Anthropic)'],
  ['Cartes', 'Leaflet / react-leaflet avec clustering'],
  ['Monitoring', 'Sentry (error tracking)'],
  ['Deploiement', 'Vercel'],
  ['Base de donnees', 'PostgreSQL (Supabase)'],
];

tableRow('COMPOSANT', 'TECHNOLOGIE', true);
doc.moveTo(60, doc.y).lineTo(530, doc.y).strokeColor(GRAY).lineWidth(0.5).stroke();
doc.moveDown(0.3);
stack.forEach(([k, v]) => tableRow(k, v));

// ============ PAGE 4 - FONCTIONNALITES ============
doc.addPage();
title('4. Fonctionnalites principales');

subtitle('Systeme d\'authentification & roles');
bullet('3 roles : Familles, Educateurs/Pros, Admins');
bullet('Supabase Auth (email/password)');
bullet('RBAC via app_metadata (non modifiable par l\'utilisateur)');
bullet('Rate limiting sur les routes sensibles');
doc.moveDown(0.5);

subtitle('Recherche & decouverte de professionnels');
bullet('Recherche par localisation, profession, experience, tarif, langues');
bullet('10 professions : Psychologue, Ergotherapeute, Orthophoniste, Psychomotricien...');
bullet('Geolocalisation et calcul de distance');
bullet('Systeme de favoris');
doc.moveDown(0.5);

subtitle('Systeme de rendez-vous complet');
bullet('Cycle : Proposition > Paiement > Acceptation > Session > Completion');
bullet('Code PIN 6 chiffres pour securiser les sessions');
bullet('Visioconference integree (Daily.co)');
bullet('Facturation automatique avec PDF');
doc.moveDown(0.5);

subtitle('Verification des professionnels');
bullet('OCR automatique des diplomes (Tesseract.js)');
bullet('Analyse IA des documents (Claude API)');
bullet('Verification DREETS, RPPS, SIRET');
bullet('Queue de moderation admin');
doc.moveDown(0.5);

checkPage(200);

subtitle('Outils familles');
bullet('Assistant MDPH guide en 8 etapes avec export PDF');
bullet('PPA (Plan Personnalise d\'Accompagnement) avec versioning');
bullet('Profils enfants (TSA, TDAH, DYS...)');
bullet('Simulateur d\'aides financieres');
doc.moveDown(0.5);

subtitle('Contenu & communaute');
bullet('Blog avec editeur riche (React Quill)');
bullet('Forum communautaire avec reactions et commentaires');
bullet('Annuaire de 6 000+ lieux TND avec carte interactive');
bullet('Pages regionales SEO');
doc.moveDown(0.5);

subtitle('Administration');
bullet('Dashboard avec statistiques globales');
bullet('Moderation : avatars, certifications, blog, feedback');
bullet('Gestion utilisateurs, paiements, logs d\'audit');

// ============ PAGE 5 - SECURITE ============
doc.addPage();
title('5. Audit securite');

subtitle('Points forts');
bullet('Row-Level Security (RLS) sur toutes les tables Supabase');
bullet('Rate limiting sur 15+ endpoints sensibles');
bullet('CSP headers configures (dev & prod)');
bullet('HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff');
bullet('Sanitization HTML avec DOMPurify');
bullet('Admin verifie via app_metadata (non modifiable cote client)');
bullet('Routes debug/test bloquees en production');
bullet('RGPD : suppression de compte, export de donnees, cookie banner');
bullet('Audit logging des actions admin');
doc.moveDown(0.5);

subtitle('Points d\'attention');
bullet('Rate limiting in-memory : se reset a chaque deploiement Vercel');
bullet('Pas de CSRF explicite (repose sur SameSite cookies + Next.js defaults)');
bullet('Pas de WAF (Web Application Firewall) configure');

// ============ PAGE 6 - SEO ============
doc.moveDown(1);
title('6. SEO & acquisition');

subtitle('Etat actuel : Excellent');
bullet('Sitemap dynamique avec 40+ routes et priorites');
bullet('Robots.txt correctement configure');
bullet('Metadata OpenGraph et Schema.org');
bullet('Langue ciblee : fr_FR');
bullet('URL canoniques configurees');
bullet('Pages regionales lieux TND (longue traine)');
doc.moveDown(0.5);

subtitle('Opportunites');
bullet('Landing pages par profession (psychomotricien autisme, ergo TSA...)');
bullet('L\'assistant MDPH comme contenu pilier pour le trafic organique');
bullet('Enrichir les pages regionales avec du contenu unique');

// ============ PAGE 7 - PROBLEMES ============
doc.addPage();
title('7. Points faibles identifies');

doc.moveDown(0.3);

// Priority table
const issues = [
  ['HAUTE', 'Tests quasi-inexistants (4 fichiers, ~38 tests)', RED],
  ['HAUTE', 'Pas de CI/CD (aucun GitHub Actions)', RED],
  ['MOYENNE', '~160 instances de catch (error: any)', ORANGE],
  ['MOYENNE', 'Pas d\'internationalisation (tout en francais hardcode)', ORANGE],
  ['BASSE', 'Rate limiting in-memory (reset au deploiement)', GRAY],
  ['BASSE', '1 seul TODO dans le code', GRAY],
];

bold('Tableau des priorites');
doc.moveDown(0.5);
issues.forEach(([priority, desc, color]) => {
  const y = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(color).text(priority, 60, y, { width: 70 });
  doc.fontSize(9).font('Helvetica').fillColor(DARK).text(desc, 140, y, { width: 390 });
  doc.moveDown(0.5);
});

// ============ PAGE 8 - RECOMMANDATIONS ============
doc.moveDown(1);
title('8. Recommandations strategiques');

subtitle('1. Priorite absolue : la fiabilite');
body('Plateforme de sante avec paiements = zero tolerance aux bugs en production.');
bullet('Ajouter des tests E2E sur les flux critiques (inscription, paiement, RDV)');
bullet('Mettre en place GitHub Actions : lint + tests avant chaque deploiement');
bullet('Objectif : ne jamais deployer de regression');
doc.moveDown(0.5);

subtitle('2. Consolider avant d\'ajouter');
body('Enormement de features pour un projet early-stage. Risque de dispersion.');
bullet('Identifier les 3 features qui convertissent (recherche, RDV, verification)');
bullet('Mesurer l\'usage reel de chaque feature');
bullet('Mettre en pause les features a faible trafic (communaute, blog si non utilises)');
bullet('Rendre le parcours recherche > RDV > suivi irreprochable');
doc.moveDown(0.5);

checkPage(250);

subtitle('3. Securiser le rate limiting');
body('Le rate limiting in-memory se reset a chaque deploiement Vercel.');
bullet('Passer sur Upstash Redis ou Vercel KV (gratuit pour faible volume)');
bullet('Implementation rapide, securisation reelle');
doc.moveDown(0.5);

subtitle('4. Ameliorer le typage des erreurs');
body('160+ catch (error: any) = bugs silencieux potentiels.');
bullet('Remplacer par catch (error: unknown) avec type guards');
bullet('Meilleure tracabilite des erreurs dans Sentry');
doc.moveDown(0.5);

subtitle('5. Penser mobile-first pour les familles');
body('Les parents cherchent des solutions sur telephone, souvent le soir.');
bullet('Verifier la fluidite du parcours recherche > reservation sur mobile');
bullet('Notifications claires et PPA utilisable sur petit ecran');
doc.moveDown(0.5);

subtitle('6. Exploiter le SEO comme canal d\'acquisition');
bullet('Pages regionales TND = mine d\'or pour la longue traine');
bullet('Assistant MDPH comme contenu pilier');
bullet('Landing pages par profession');
doc.moveDown(0.5);

checkPage(200);

subtitle('7. Ce qui manque');
const missing = [
  ['Analytics / metriques d\'usage', 'Savoir ce qui marche vraiment'],
  ['Onboarding mesure', 'Taux de completion profil, taux de booking'],
  ['Systeme d\'avis visible', 'Confiance cle dans le medico-social'],
  ['PWA / notifications push', 'Familles prevenues sur mobile'],
];
missing.forEach(([what, why]) => {
  bullet(`${what} : ${why}`);
});

// ============ PAGE 9 - CONCLUSION ============
doc.addPage();
title('9. Conclusion');

doc.moveDown(0.5);
body('NeuroCare est un produit ambitieux et bien architecture qui repond a un vrai besoin societal. La plateforme couvre un spectre fonctionnel large : de la recherche de professionnels a la visioconference, en passant par l\'assistance administrative MDPH et le suivi personnalise PPA.');
doc.moveDown(0.5);
body('L\'architecture technique est solide (Next.js 14, Supabase, TypeScript strict) et la securite a ete pensee des le depart (RLS, rate limiting, CSP headers).');
doc.moveDown(0.5);
body('Les axes d\'amelioration prioritaires sont :');
doc.moveDown(0.3);
bullet('La fiabilite (tests + CI/CD) pour securiser les deployments');
bullet('La consolidation des features existantes plutot que l\'ajout de nouvelles');
bullet('La mesure de l\'usage pour prioriser les efforts');
doc.moveDown(1);

bold('Recommandation principale :');
doc.moveDown(0.3);
body('Arreter d\'ajouter des features. Securiser ce qui existe (tests + CI). Mesurer l\'usage. Optimiser les 3 parcours qui comptent : recherche, prise de RDV, suivi. C\'est ce qui fera que les familles restent et recommandent la plateforme.');

doc.moveDown(3);
doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(PRIMARY).lineWidth(1).stroke();
doc.moveDown(0.5);
doc.fontSize(9).fillColor(GRAY).font('Helvetica').text('Document genere automatiquement par Claude Code (Opus 4.6) - 30 mars 2026', { align: 'center' });
doc.fontSize(9).fillColor(GRAY).font('Helvetica').text('NeuroCare - autisme-connect', { align: 'center' });

// Finalize
doc.end();

stream.on('finish', () => {
  console.log(`PDF genere avec succes : ${outputPath}`);
});
