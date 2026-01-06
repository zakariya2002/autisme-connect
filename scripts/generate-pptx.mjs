import PptxGenJS from 'pptxgenjs';

// Créer une nouvelle présentation
const pptx = new PptxGenJS();

// Configuration globale
pptx.author = 'NeuroCare';
pptx.title = 'Présentation NeuroCare';
pptx.subject = 'Plateforme de mise en relation pour l\'accompagnement du neurodéveloppement';
pptx.company = 'NeuroCare';

// Couleurs de la charte graphique
const TEAL = '027e7e';
const TEAL_LIGHT = '3a9e9e';
const PINK = 'f0879f';
const BEIGE = 'fdf9f4';
const VIOLET = '41005c';

// Chemin des assets
const ASSETS_DIR = './presentation-assets';
const LOGO_PATH = `${ASSETS_DIR}/logo.png`;
const PICTO_CALENDAR = `${ASSETS_DIR}/picto-calendar.png`;
const PICTO_CHAT = `${ASSETS_DIR}/picto-chat.png`;
const PICTO_1 = `${ASSETS_DIR}/picto-1.png`;
const PICTO_2 = `${ASSETS_DIR}/picto-2.png`;
const PICTO_3 = `${ASSETS_DIR}/picto-3.png`;
const PICTO_6 = `${ASSETS_DIR}/picto-6.png`;
const PICTO_7 = `${ASSETS_DIR}/picto-7.png`;
const PICTO_8 = `${ASSETS_DIR}/picto-8.png`;
const PICTO_9 = `${ASSETS_DIR}/picto-9.png`;

// Fonction pour créer un slide avec titre
const createTitleSlide = (title, subtitle, bgColor = TEAL) => {
  const slide = pptx.addSlide();
  slide.bkgd = bgColor;

  slide.addText(title, {
    x: 0.5, y: 2, w: '90%', h: 1.5,
    fontSize: 44, bold: true, color: 'FFFFFF',
    align: 'center', fontFace: 'Arial'
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 3.5, w: '90%', h: 1,
      fontSize: 24, color: 'FFFFFF',
      align: 'center', fontFace: 'Arial'
    });
  }

  return slide;
};

// Fonction pour créer un slide de contenu
const createContentSlide = (title, content, bgColor = 'FFFFFF') => {
  const slide = pptx.addSlide();
  slide.bkgd = bgColor;

  // Bandeau titre
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 1.2,
    fill: { color: TEAL }
  });

  slide.addText(title, {
    x: 0.5, y: 0.3, w: '90%', h: 0.7,
    fontSize: 28, bold: true, color: 'FFFFFF',
    fontFace: 'Arial'
  });

  return slide;
};

// =====================
// SLIDE 1 - Page de garde
// =====================
const slide1 = pptx.addSlide();
slide1.bkgd = TEAL;

// Logo en haut
slide1.addImage({
  path: LOGO_PATH,
  x: 3, y: 0.5, w: 4, h: 1.6,
  sizing: { type: 'contain' }
});

slide1.addText('neurocare', {
  x: 0.5, y: 2.2, w: '90%', h: 1.2,
  fontSize: 60, bold: true, color: 'FFFFFF',
  align: 'center', fontFace: 'Arial'
});

slide1.addText('Professionnels du Neuro Développement\nprès de chez vous', {
  x: 0.5, y: 3.4, w: '90%', h: 1,
  fontSize: 28, color: 'FFFFFF',
  align: 'center', fontFace: 'Arial'
});

slide1.addText('Plateforme gratuite pour les familles', {
  x: 0.5, y: 4.4, w: '90%', h: 0.5,
  fontSize: 20, color: BEIGE, italic: true,
  align: 'center', fontFace: 'Arial'
});

slide1.addText('Connecter  •  Accompagner  •  Transformer', {
  x: 0.5, y: 4.9, w: '90%', h: 0.5,
  fontSize: 18, color: 'FFFFFF',
  align: 'center', fontFace: 'Arial'
});

slide1.addText('www.neuro-care.fr', {
  x: 0.5, y: 5.4, w: '90%', h: 0.4,
  fontSize: 16, color: BEIGE,
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 2 - Le Problème
// =====================
const slide2 = createContentSlide('Le Problème');

slide2.addText('Un constat alarmant', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 24, bold: true, color: TEAL,
  fontFace: 'Arial'
});

const problemes = [
  { text: '+700 000 ', options: { bold: true, color: PINK } },
  { text: 'enfants concernés par les TND en France\n\n' },
  { text: '2 à 3 ans ', options: { bold: true, color: PINK } },
  { text: 'd\'attente moyenne pour obtenir un diagnostic\n\n' },
  { text: 'Manque cruel ', options: { bold: true, color: PINK } },
  { text: 'de professionnels disponibles\n\n' },
  { text: 'Familles perdues ', options: { bold: true, color: PINK } },
  { text: 'face à la complexité du parcours de soin\n\n' },
  { text: 'Difficultés ', options: { bold: true, color: PINK } },
  { text: 'à trouver des professionnels qualifiés et vérifiés' }
];

slide2.addText(problemes, {
  x: 0.5, y: 2.1, w: '90%', h: 2.5,
  fontSize: 18, color: '333333',
  fontFace: 'Arial', valign: 'top'
});

slide2.addText('Les familles ont besoin de solutions MAINTENANT', {
  x: 0.5, y: 4.8, w: '90%', h: 0.5,
  fontSize: 20, bold: true, color: TEAL,
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 3 - Notre Solution
// =====================
const slide3 = createContentSlide('Notre Solution');

slide3.addText('neurocare : La réponse', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 24, bold: true, color: TEAL,
  fontFace: 'Arial'
});

slide3.addText('Une plateforme digitale qui connecte :', {
  x: 0.5, y: 2.1, w: '90%', h: 0.4,
  fontSize: 18, color: '333333',
  fontFace: 'Arial'
});

// Tableau
const tableData = [
  [
    { text: 'Familles & Aidants', options: { bold: true, fill: { color: TEAL }, color: 'FFFFFF' } },
    { text: '↔', options: { bold: true, fill: { color: PINK }, color: 'FFFFFF', align: 'center' } },
    { text: 'Professionnels qualifiés', options: { bold: true, fill: { color: TEAL }, color: 'FFFFFF' } }
  ],
  [
    { text: 'Recherche simplifiée', options: { fill: { color: 'E8F5F5' } } },
    { text: '', options: { fill: { color: 'FDF0F3' } } },
    { text: 'Visibilité accrue', options: { fill: { color: 'E8F5F5' } } }
  ],
  [
    { text: 'Contact direct', options: { fill: { color: 'FFFFFF' } } },
    { text: '', options: { fill: { color: 'FFFFFF' } } },
    { text: 'Gestion des RDV', options: { fill: { color: 'FFFFFF' } } }
  ],
  [
    { text: 'Gratuit', options: { fill: { color: 'E8F5F5' } } },
    { text: '', options: { fill: { color: 'FDF0F3' } } },
    { text: 'Développement clientèle', options: { fill: { color: 'E8F5F5' } } }
  ]
];

slide3.addTable(tableData, {
  x: 0.5, y: 2.6, w: 9,
  fontSize: 14, fontFace: 'Arial',
  border: { pt: 1, color: 'CCCCCC' },
  align: 'center', valign: 'middle'
});

slide3.addText('Mise en relation simple, rapide et sécurisée', {
  x: 0.5, y: 4.8, w: '90%', h: 0.5,
  fontSize: 20, bold: true, color: TEAL,
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 4 - Nos Valeurs
// =====================
const slide4 = createContentSlide('Nos Valeurs');

slide4.addText('Ce qui nous guide', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 24, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

// Valeur 1 - Bienveillance
slide4.addShape(pptx.ShapeType.roundRect, {
  x: 0.5, y: 2.2, w: 2.8, h: 2.5,
  fill: { color: 'FDF0F3' },
  line: { color: PINK, pt: 2 }
});
slide4.addText('Bienveillance', {
  x: 0.6, y: 2.4, w: 2.6, h: 0.5,
  fontSize: 18, bold: true, color: PINK,
  align: 'center', fontFace: 'Arial'
});
slide4.addText('L\'humain au coeur de notre démarche, avec empathie et respect', {
  x: 0.6, y: 3, w: 2.6, h: 1.5,
  fontSize: 12, color: '333333',
  align: 'center', fontFace: 'Arial'
});

// Valeur 2 - Confiance
slide4.addShape(pptx.ShapeType.roundRect, {
  x: 3.6, y: 2.2, w: 2.8, h: 2.5,
  fill: { color: 'E8F5F5' },
  line: { color: TEAL, pt: 2 }
});
slide4.addText('Confiance', {
  x: 3.7, y: 2.4, w: 2.6, h: 0.5,
  fontSize: 18, bold: true, color: TEAL,
  align: 'center', fontFace: 'Arial'
});
slide4.addText('Vérification rigoureuse des diplômes et transparence des profils', {
  x: 3.7, y: 3, w: 2.6, h: 1.5,
  fontSize: 12, color: '333333',
  align: 'center', fontFace: 'Arial'
});

// Valeur 3 - Accessibilité
slide4.addShape(pptx.ShapeType.roundRect, {
  x: 6.7, y: 2.2, w: 2.8, h: 2.5,
  fill: { color: 'F3E8FF' },
  line: { color: VIOLET, pt: 2 }
});
slide4.addText('Accessibilité', {
  x: 6.8, y: 2.4, w: 2.6, h: 0.5,
  fontSize: 18, bold: true, color: VIOLET,
  align: 'center', fontFace: 'Arial'
});
slide4.addText('Accès simple, rapide et sans barrière financière pour les familles', {
  x: 6.8, y: 3, w: 2.6, h: 1.5,
  fontSize: 12, color: '333333',
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 5 - Fonctionnalités Aidants 1/2
// =====================
const slide5 = createContentSlide('Fonctionnalités Aidants (1/2)');

slide5.addText('Espace Famille / Aidant', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial'
});

slide5.addText('Recherche avancée', {
  x: 0.5, y: 2.1, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: PINK,
  fontFace: 'Arial'
});

slide5.addText('• Par type de professionnel\n• Par localisation et rayon\n• Par spécialisation TND\n• Par tarif, expérience, note', {
  x: 0.5, y: 2.5, w: 4, h: 1.5,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

// Pictogramme calendrier
slide5.addImage({
  path: PICTO_CALENDAR,
  x: 8.2, y: 1.6, w: 1, h: 1,
  sizing: { type: 'contain' }
});

slide5.addText('Gestion des rendez-vous', {
  x: 5, y: 2.1, w: 4, h: 0.4,
  fontSize: 18, bold: true, color: PINK,
  fontFace: 'Arial'
});

slide5.addText('• Réservation en ligne\n• Paiement sécurisé (Stripe)\n• Annulation gratuite 48h avant\n• Ajout au calendrier', {
  x: 5, y: 2.5, w: 3.2, h: 1.5,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

// =====================
// SLIDE 6 - Fonctionnalités Aidants 2/2
// =====================
const slide6 = createContentSlide('Fonctionnalités Aidants (2/2)');

slide6.addText('Espace Famille / Aidant', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial'
});

slide6.addText('Gestion des enfants/proches', {
  x: 0.5, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide6.addText('• Profils détaillés (TND, besoins)\n• Plan d\'accompagnement (PPA)\n• Dossier avec documents', {
  x: 0.5, y: 2.5, w: 4, h: 1,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

// Pictogramme messagerie
slide6.addImage({
  path: PICTO_CHAT,
  x: 8.2, y: 1.6, w: 1, h: 1,
  sizing: { type: 'contain' }
});

slide6.addText('Messagerie', {
  x: 5, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide6.addText('• Chat en temps réel\n• Demandes de contact qualifiées\n• Historique des échanges', {
  x: 5, y: 2.5, w: 3.2, h: 1,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

slide6.addText('Avis et favoris', {
  x: 0.5, y: 3.7, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide6.addText('• Laisser des avis après les séances\n• Sauvegarder ses professionnels préférés', {
  x: 0.5, y: 4.1, w: 8, h: 0.8,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

// =====================
// SLIDE 7 - Fonctionnalités Pro 1/2
// =====================
const slide7 = createContentSlide('Fonctionnalités Professionnels (1/2)');

slide7.addText('Espace Professionnel', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: VIOLET,
  fontFace: 'Arial'
});

slide7.addText('Profil complet', {
  x: 0.5, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide7.addText('• Présentation, spécialisations, tarifs\n• Photo et vidéo de présentation\n• Badge "Vérifié"', {
  x: 0.5, y: 2.5, w: 4, h: 1,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

slide7.addText('Vérification DREETS', {
  x: 5, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide7.addText('• Upload des diplômes\n• Antécédents judiciaires\n• Assurance RC\n• Pièce d\'identité', {
  x: 5, y: 2.5, w: 4, h: 1.2,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

slide7.addText('Gestion des disponibilités', {
  x: 0.5, y: 3.8, w: 8, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide7.addText('• Calendrier personnalisable • Créneaux horaires • Jours de congé', {
  x: 0.5, y: 4.2, w: 8, h: 0.5,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

// =====================
// SLIDE 8 - Fonctionnalités Pro 2/2
// =====================
const slide8 = createContentSlide('Fonctionnalités Professionnels (2/2)');

slide8.addText('Espace Professionnel', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: VIOLET,
  fontFace: 'Arial'
});

slide8.addText('Gestion des rendez-vous', {
  x: 0.5, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide8.addText('• Accepter/refuser les demandes\n• Suivi des séances\n• Facturation automatique', {
  x: 0.5, y: 2.5, w: 4, h: 1,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

slide8.addText('Séances en visio', {
  x: 5, y: 2.1, w: 4, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide8.addText('• Vidéoconférence intégrée\n• Code PIN sécurisé\n• Minuteur de séance', {
  x: 5, y: 2.5, w: 4, h: 1,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

slide8.addText('Blog personnel', {
  x: 0.5, y: 3.7, w: 8, h: 0.4,
  fontSize: 16, bold: true, color: PINK,
  fontFace: 'Arial'
});
slide8.addText('• Rédiger des articles • Partager son expertise • Améliorer sa visibilité', {
  x: 0.5, y: 4.1, w: 8, h: 0.5,
  fontSize: 13, color: '333333',
  fontFace: 'Arial'
});

// =====================
// SLIDE 9 - Blog
// =====================
const slide9 = createContentSlide('Espace Blog');

// Pictogramme blog
slide9.addImage({
  path: PICTO_2,
  x: 8, y: 1.4, w: 1.2, h: 1.2,
  sizing: { type: 'contain' }
});

slide9.addText('Contenu de qualité', {
  x: 0.5, y: 1.5, w: '85%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial'
});

slide9.addText('• Articles rédigés par des professionnels vérifiés\n• Thématiques : TND, TSA, TDAH, troubles DYS...\n• Conseils pratiques pour les familles', {
  x: 0.5, y: 2.1, w: '90%', h: 1,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

slide9.addText('Objectifs', {
  x: 0.5, y: 3.2, w: '90%', h: 0.4,
  fontSize: 18, bold: true, color: PINK,
  fontFace: 'Arial'
});

slide9.addText('• Informer les familles sur les TND\n• Valoriser l\'expertise des professionnels\n• Créer du contenu SEO pour la visibilité', {
  x: 0.5, y: 3.6, w: '90%', h: 1,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

slide9.addText('Modération : Validation avant publication - Qualité garantie', {
  x: 0.5, y: 4.8, w: '90%', h: 0.4,
  fontSize: 14, bold: true, color: TEAL,
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 10 - Communauté
// =====================
const slide10 = createContentSlide('Espace Communauté');

// Pictogramme communauté
slide10.addImage({
  path: PICTO_1,
  x: 8, y: 1.4, w: 1.2, h: 1.2,
  sizing: { type: 'contain' }
});

slide10.addText('Un lieu d\'échange', {
  x: 0.5, y: 1.5, w: '85%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial'
});

slide10.addText('• Forum de discussion entre familles et professionnels\n• Partage d\'expériences\n• Entraide et soutien', {
  x: 0.5, y: 2.1, w: '90%', h: 1,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

slide10.addText('Fonctionnalités', {
  x: 0.5, y: 3.2, w: '90%', h: 0.4,
  fontSize: 18, bold: true, color: PINK,
  fontFace: 'Arial'
});

slide10.addText('• Créer des posts\n• Commenter et réagir\n• Option de publication anonyme\n• Modération du contenu', {
  x: 0.5, y: 3.6, w: '90%', h: 1.2,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

slide10.addText('Briser l\'isolement des familles et créer une communauté bienveillante', {
  x: 0.5, y: 4.9, w: '90%', h: 0.4,
  fontSize: 14, bold: true, color: TEAL,
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 11 - Sécurité & Confiance
// =====================
const slide11 = createContentSlide('Sécurité & Confiance');

slide11.addText('Garanties de qualité', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

// 4 boxes
const securityItems = [
  { title: 'Diplômes vérifiés', desc: 'Vérification DREETS', x: 0.5, color: TEAL },
  { title: 'Paiement sécurisé', desc: 'Stripe (leader mondial)', x: 2.8, color: TEAL_LIGHT },
  { title: 'Modération', desc: 'Contenu et comportements', x: 5.1, color: PINK },
  { title: 'RGPD', desc: 'Données protégées', x: 7.4, color: VIOLET }
];

securityItems.forEach((item, i) => {
  slide11.addShape(pptx.ShapeType.roundRect, {
    x: item.x, y: 2.2, w: 2.1, h: 2,
    fill: { color: 'F5F5F5' },
    line: { color: item.color, pt: 2 }
  });
  slide11.addText(item.title, {
    x: item.x, y: 2.4, w: 2.1, h: 0.5,
    fontSize: 14, bold: true, color: item.color,
    align: 'center', fontFace: 'Arial'
  });
  slide11.addText(item.desc, {
    x: item.x, y: 3, w: 2.1, h: 1,
    fontSize: 11, color: '333333',
    align: 'center', fontFace: 'Arial'
  });
});

// =====================
// SLIDE 12 - Types de professionnels
// =====================
const slide12 = createContentSlide('+10 professions représentées');

const profTable = [
  [
    { text: 'Catégorie', options: { bold: true, fill: { color: TEAL }, color: 'FFFFFF' } },
    { text: 'Professions', options: { bold: true, fill: { color: TEAL }, color: 'FFFFFF' } }
  ],
  [{ text: 'Éducatif', options: { bold: true } }, { text: 'Éducateur spécialisé, Moniteur éducateur' }],
  [{ text: 'Psychologie', options: { bold: true } }, { text: 'Psychologue, Neuropsychologue' }],
  [{ text: 'Thérapies', options: { bold: true } }, { text: 'Psychomotricien, Orthophoniste, Ergothérapeute' }],
  [{ text: 'Médical', options: { bold: true } }, { text: 'Kinésithérapeute' }],
  [{ text: 'Autres', options: { bold: true } }, { text: 'Enseignant APA, Musicothérapeute' }]
];

slide12.addTable(profTable, {
  x: 0.5, y: 1.5, w: 9,
  fontSize: 14, fontFace: 'Arial',
  border: { pt: 1, color: 'CCCCCC' },
  colW: [2, 7]
});

slide12.addText('Spécialisations TND', {
  x: 0.5, y: 4.2, w: '90%', h: 0.4,
  fontSize: 18, bold: true, color: PINK,
  fontFace: 'Arial'
});

slide12.addText('TSA, TDAH, DYS (dyslexie, dyspraxie, dyscalculie...), TDI', {
  x: 0.5, y: 4.6, w: '90%', h: 0.4,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

// =====================
// SLIDE 13 - Comment ça marche
// =====================
const slide13 = createContentSlide('Comment ça marche ?');

slide13.addText('4 étapes simples', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

const steps = [
  { num: '1', title: 'Créez votre compte', desc: 'Inscription gratuite', x: 0.5 },
  { num: '2', title: 'Recherchez', desc: 'Filtrez par critères', x: 2.8 },
  { num: '3', title: 'Contactez', desc: 'Échangez directement', x: 5.1 },
  { num: '4', title: 'Réservez', desc: 'RDV en ligne', x: 7.4 }
];

steps.forEach((step, i) => {
  const colors = [TEAL, TEAL_LIGHT, '6bbebe', '9bd4d4'];
  slide13.addShape(pptx.ShapeType.ellipse, {
    x: step.x + 0.6, y: 2.2, w: 0.9, h: 0.9,
    fill: { color: colors[i] }
  });
  slide13.addText(step.num, {
    x: step.x + 0.6, y: 2.35, w: 0.9, h: 0.6,
    fontSize: 24, bold: true, color: 'FFFFFF',
    align: 'center', fontFace: 'Arial'
  });
  slide13.addText(step.title, {
    x: step.x, y: 3.2, w: 2.1, h: 0.5,
    fontSize: 14, bold: true, color: '333333',
    align: 'center', fontFace: 'Arial'
  });
  slide13.addText(step.desc, {
    x: step.x, y: 3.7, w: 2.1, h: 0.5,
    fontSize: 12, color: '666666',
    align: 'center', fontFace: 'Arial'
  });
});

// =====================
// SLIDE 14 - Modèle économique
// =====================
const slide14 = createContentSlide('Modèle économique');

slide14.addText('Gratuit pour les familles', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 24, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

slide14.addText('Pour les professionnels', {
  x: 0.5, y: 2.2, w: '90%', h: 0.4,
  fontSize: 18, bold: true, color: PINK,
  fontFace: 'Arial'
});

const pricingTable = [
  [
    { text: 'Offre', options: { bold: true, fill: { color: TEAL }, color: 'FFFFFF' } },
    { text: 'Prix', options: { bold: true, fill: { color: TEAL }, color: 'FFFFFF' } },
    { text: 'Avantages', options: { bold: true, fill: { color: TEAL }, color: 'FFFFFF' } }
  ],
  [{ text: 'Gratuit', options: { bold: true } }, { text: '0€' }, { text: '1 conversation, profil basique' }],
  [{ text: 'Premium', options: { bold: true, color: PINK } }, { text: 'X€/mois' }, { text: 'Illimité, priorité, blog, badge' }]
];

slide14.addTable(pricingTable, {
  x: 0.5, y: 2.7, w: 9,
  fontSize: 13, fontFace: 'Arial',
  border: { pt: 1, color: 'CCCCCC' },
  colW: [1.5, 1.5, 6]
});

slide14.addText('+ Commission sur les rendez-vous réservés', {
  x: 0.5, y: 4.2, w: '90%', h: 0.4,
  fontSize: 14, color: '333333',
  fontFace: 'Arial'
});

slide14.addText('Modèle durable et équitable', {
  x: 0.5, y: 4.8, w: '90%', h: 0.4,
  fontSize: 16, bold: true, color: TEAL,
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 15 - L'équipe
// =====================
const slide15 = createContentSlide('L\'équipe');

// Pictogramme équipe
slide15.addImage({
  path: PICTO_7,
  x: 8.3, y: 1.4, w: 1, h: 1,
  sizing: { type: 'contain' }
});

slide15.addText('Les visages derrière le projet', {
  x: 0.5, y: 1.5, w: '80%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

const team = [
  { initials: 'ZB', name: 'Zakariya B.', role: 'Fondateur & Développeur', desc: 'Impact social et technologie', color: TEAL },
  { initials: 'ML', name: 'Marie L.', role: 'Éducatrice Spécialisée DEES', desc: '8 ans d\'expérience', color: TEAL_LIGHT },
  { initials: 'SP', name: 'Sophie P.', role: 'Ambassadrice Familles', desc: 'Maman d\'un enfant TSA', color: '6bbebe' }
];

team.forEach((member, i) => {
  const x = 0.5 + i * 3.2;
  slide15.addShape(pptx.ShapeType.ellipse, {
    x: x + 0.8, y: 2.1, w: 1.2, h: 1.2,
    fill: { color: member.color }
  });
  slide15.addText(member.initials, {
    x: x + 0.8, y: 2.35, w: 1.2, h: 0.7,
    fontSize: 20, bold: true, color: 'FFFFFF',
    align: 'center', fontFace: 'Arial'
  });
  slide15.addText(member.name, {
    x: x, y: 3.4, w: 2.8, h: 0.4,
    fontSize: 14, bold: true, color: '333333',
    align: 'center', fontFace: 'Arial'
  });
  slide15.addText(member.role, {
    x: x, y: 3.8, w: 2.8, h: 0.4,
    fontSize: 11, bold: true, color: member.color,
    align: 'center', fontFace: 'Arial'
  });
  slide15.addText(member.desc, {
    x: x, y: 4.2, w: 2.8, h: 0.4,
    fontSize: 10, color: '666666',
    align: 'center', fontFace: 'Arial'
  });
});

// =====================
// SLIDE 16 - Chiffres clés
// =====================
const slide16 = createContentSlide('Chiffres clés');

slide16.addText('Notre impact', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

const metrics = [
  { label: 'Professionnels\ninscrits', value: 'XX', color: TEAL },
  { label: 'Familles\naccompagnées', value: 'XX', color: TEAL_LIGHT },
  { label: 'Rendez-vous\nréalisés', value: 'XX', color: PINK },
  { label: 'Note\nmoyenne', value: '4.X/5', color: VIOLET }
];

metrics.forEach((m, i) => {
  const x = 0.5 + i * 2.4;
  slide16.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 2.2, w: 2.2, h: 2,
    fill: { color: 'F5F5F5' },
    line: { color: m.color, pt: 2 }
  });
  slide16.addText(m.value, {
    x: x, y: 2.4, w: 2.2, h: 0.8,
    fontSize: 32, bold: true, color: m.color,
    align: 'center', fontFace: 'Arial'
  });
  slide16.addText(m.label, {
    x: x, y: 3.2, w: 2.2, h: 0.8,
    fontSize: 11, color: '333333',
    align: 'center', fontFace: 'Arial'
  });
});

slide16.addText('Chiffres en croissance constante', {
  x: 0.5, y: 4.5, w: '90%', h: 0.4,
  fontSize: 14, italic: true, color: '666666',
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 17 - Roadmap
// =====================
const slide17 = createContentSlide('Roadmap');

// Pictogramme roadmap
slide17.addImage({
  path: PICTO_6,
  x: 8.3, y: 1.4, w: 1, h: 1,
  sizing: { type: 'contain' }
});

slide17.addText('Évolutions prévues', {
  x: 0.5, y: 1.5, w: '80%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

const roadmap = [
  { title: 'Court terme', items: '• App mobile iOS/Android\n• Intégration calendriers\n• Notifications push', color: TEAL },
  { title: 'Moyen terme', items: '• Téléconsultation améliorée\n• Partenariats MDPH/ARS\n• Crédit d\'impôt auto', color: PINK },
  { title: 'Long terme', items: '• Extension nationale\n• IA de matching\n• Parcours de soin intégré', color: VIOLET }
];

roadmap.forEach((phase, i) => {
  const x = 0.5 + i * 3.2;
  slide17.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 2.1, w: 3, h: 2.5,
    fill: { color: 'FFFFFF' },
    line: { color: phase.color, pt: 2 }
  });
  slide17.addText(phase.title, {
    x: x, y: 2.2, w: 3, h: 0.5,
    fontSize: 16, bold: true, color: phase.color,
    align: 'center', fontFace: 'Arial'
  });
  slide17.addText(phase.items, {
    x: x + 0.2, y: 2.7, w: 2.6, h: 1.8,
    fontSize: 11, color: '333333',
    fontFace: 'Arial'
  });
});

// =====================
// SLIDE 18 - Partenariats
// =====================
const slide18 = createContentSlide('Partenariats recherchés');

// Pictogramme partenariat
slide18.addImage({
  path: PICTO_3,
  x: 8.3, y: 1.4, w: 1, h: 1,
  sizing: { type: 'contain' }
});

slide18.addText('Travaillons ensemble', {
  x: 0.5, y: 1.5, w: '80%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

const partners = [
  { title: 'Institutions', items: 'ARS, MDPH, CAF,\nConseils départementaux', color: TEAL },
  { title: 'Structures médico-sociales', items: 'IME, SESSAD, CAMSP,\nAssociations de familles', color: PINK },
  { title: 'Formation', items: 'IRTS, Universités,\nOrganismes de formation', color: VIOLET }
];

partners.forEach((p, i) => {
  const x = 0.5 + i * 3.2;
  slide18.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 2.1, w: 3, h: 2,
    fill: { color: 'F5F5F5' },
    line: { color: p.color, pt: 2 }
  });
  slide18.addText(p.title, {
    x: x, y: 2.3, w: 3, h: 0.5,
    fontSize: 14, bold: true, color: p.color,
    align: 'center', fontFace: 'Arial'
  });
  slide18.addText(p.items, {
    x: x, y: 2.8, w: 3, h: 1.2,
    fontSize: 11, color: '333333',
    align: 'center', fontFace: 'Arial'
  });
});

// =====================
// SLIDE 19 - Pourquoi nous soutenir
// =====================
const slide19 = createContentSlide('Pourquoi nous soutenir ?');

slide19.addText('Impact social fort', {
  x: 0.5, y: 1.5, w: '90%', h: 0.5,
  fontSize: 22, bold: true, color: TEAL,
  fontFace: 'Arial', align: 'center'
});

const impacts = [
  'Réduire les délais d\'accès aux soins',
  'Faciliter le quotidien des familles',
  'Valoriser les professionnels du secteur',
  'Moderniser le médico-social',
  'Créer du lien dans une communauté bienveillante'
];

impacts.forEach((impact, i) => {
  slide19.addText('✓', {
    x: 1, y: 2.1 + i * 0.5, w: 0.3, h: 0.4,
    fontSize: 16, bold: true, color: TEAL,
    fontFace: 'Arial'
  });
  slide19.addText(impact, {
    x: 1.4, y: 2.1 + i * 0.5, w: 7, h: 0.4,
    fontSize: 16, color: '333333',
    fontFace: 'Arial'
  });
});

slide19.addText('Ensemble, changeons la donne !', {
  x: 0.5, y: 4.8, w: '90%', h: 0.5,
  fontSize: 20, bold: true, color: PINK,
  align: 'center', fontFace: 'Arial'
});

// =====================
// SLIDE 20 - Contact
// =====================
const slide20 = pptx.addSlide();
slide20.bkgd = TEAL;

// Logo en haut
slide20.addImage({
  path: LOGO_PATH,
  x: 3, y: 0.3, w: 4, h: 1.4,
  sizing: { type: 'contain' }
});

slide20.addText('Rejoignez-nous', {
  x: 0.5, y: 1.8, w: '90%', h: 0.8,
  fontSize: 36, bold: true, color: 'FFFFFF',
  align: 'center', fontFace: 'Arial'
});

slide20.addText('Site web', {
  x: 0.5, y: 2.7, w: '90%', h: 0.4,
  fontSize: 18, bold: true, color: BEIGE,
  align: 'center', fontFace: 'Arial'
});
slide20.addText('www.neuro-care.fr', {
  x: 0.5, y: 3.1, w: '90%', h: 0.4,
  fontSize: 20, color: 'FFFFFF',
  align: 'center', fontFace: 'Arial'
});

slide20.addText('Email', {
  x: 0.5, y: 3.6, w: '90%', h: 0.4,
  fontSize: 18, bold: true, color: BEIGE,
  align: 'center', fontFace: 'Arial'
});
slide20.addText('contact@neuro-care.fr', {
  x: 0.5, y: 4, w: '90%', h: 0.4,
  fontSize: 20, color: 'FFFFFF',
  align: 'center', fontFace: 'Arial'
});

slide20.addText('Merci de votre attention !', {
  x: 0.5, y: 4.7, w: '90%', h: 0.6,
  fontSize: 24, bold: true, color: 'FFFFFF',
  align: 'center', fontFace: 'Arial'
});

slide20.addText('neurocare - Connecter, accompagner, transformer', {
  x: 0.5, y: 5.3, w: '90%', h: 0.4,
  fontSize: 14, italic: true, color: BEIGE,
  align: 'center', fontFace: 'Arial'
});

// =====================
// Sauvegarder le fichier
// =====================
const outputPath = '/home/zakariya/Bureau/saasprojet/autisme-connect/Presentation_NeuroCare.pptx';

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✅ Présentation créée avec succès : ${outputPath}`);
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
  });
