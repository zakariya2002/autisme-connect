-- CRÉER 15 PROFILS D'ÉDUCATEURS DE TEST
-- Ce script insère 15 profils d'éducateurs avec des données variées pour tester les fonctionnalités

-- Note: Ces profils n'ont pas de user_id associé (ce sont des profils orphelins pour les tests)
-- Si vous voulez les associer à de vrais comptes, créez d'abord les comptes utilisateurs

INSERT INTO educator_profiles (
  first_name,
  last_name,
  email,
  phone,
  location,
  latitude,
  longitude,
  bio,
  specialties,
  certifications,
  experience_years,
  hourly_rate
) VALUES
-- Paris et région parisienne
(
  'Sophie',
  'Martin',
  'sophie.martin@example.com',
  '06 12 34 56 78',
  'Paris 15ème',
  48.8422,
  2.2881,
  'Éducatrice spécialisée avec 8 ans d''expérience auprès d''enfants avec TSA. Formée aux méthodes ABA et TEACCH.',
  'ABA, TEACCH, Inclusion scolaire',
  'Certification ABA, Master en Sciences de l''Éducation',
  8,
  45
),
(
  'Thomas',
  'Dubois',
  'thomas.dubois@example.com',
  '06 23 45 67 89',
  'Versailles',
  48.8049,
  2.1204,
  'Spécialisé dans l''accompagnement des adolescents avec autisme. Expert en communication alternative.',
  'PECS, Communication alternative, Habiletés sociales',
  'Certification PECS, Formation MAKATON',
  6,
  42
),
(
  'Marie',
  'Leroy',
  'marie.leroy@example.com',
  '06 34 56 78 90',
  'Boulogne-Billancourt',
  48.8356,
  2.2402,
  'Accompagnement personnalisé des enfants avec TSA de 3 à 10 ans. Approche bienveillante et structurée.',
  'ABA, Jeux éducatifs, Autonomie',
  'Master Psychologie, Certification ABA',
  5,
  40
),

-- Lyon et région
(
  'Antoine',
  'Bernard',
  'antoine.bernard@example.com',
  '06 45 67 89 01',
  'Lyon 3ème',
  45.7578,
  4.8448,
  'Éducateur spécialisé passionné par l''inclusion scolaire et l''autonomie des enfants avec autisme.',
  'TEACCH, Inclusion scolaire, Autonomie quotidienne',
  'Diplôme d''État Éducateur Spécialisé, Formation TEACCH',
  10,
  48
),
(
  'Camille',
  'Petit',
  'camille.petit@example.com',
  '06 56 78 90 12',
  'Villeurbanne',
  45.7667,
  4.8797,
  'Spécialiste de l''intervention précoce auprès des jeunes enfants avec TSA (0-6 ans).',
  'ABA, Intervention précoce, Guidance parentale',
  'Certification ESDM, Master Neurosciences',
  7,
  44
),

-- Marseille et région
(
  'Julien',
  'Moreau',
  'julien.moreau@example.com',
  '06 67 89 01 23',
  'Marseille 8ème',
  43.2465,
  5.3883,
  'Accompagnement des personnes avec TSA et troubles du comportement. Approche positive.',
  'ABA, Gestion des comportements, Renforcement positif',
  'Certification ABA, Formation en Analyse Fonctionnelle',
  9,
  46
),
(
  'Emma',
  'Simon',
  'emma.simon@example.com',
  '06 78 90 12 34',
  'Aix-en-Provence',
  43.5297,
  5.4474,
  'Éducatrice spécialisée en communication et développement du langage chez les enfants avec autisme.',
  'PECS, Orthophonie, Communication augmentée',
  'Certification PECS, Licence Sciences du Langage',
  4,
  38
),

-- Toulouse et région
(
  'Lucas',
  'Laurent',
  'lucas.laurent@example.com',
  '06 89 01 23 45',
  'Toulouse Centre',
  43.6045,
  1.4442,
  'Expert en habiletés sociales et en intégration en milieu ordinaire. Accompagnement bienveillant.',
  'Habiletés sociales, Intégration scolaire, ABA',
  'Master Psychologie Sociale, Certification ABA',
  6,
  43
),
(
  'Léa',
  'Roux',
  'lea.roux@example.com',
  '06 90 12 34 56',
  'Blagnac',
  43.6364,
  1.3889,
  'Accompagnement des enfants avec TSA dans le développement de l''autonomie et des compétences du quotidien.',
  'Autonomie, AVJ (Activités de la Vie Journalière), TEACCH',
  'Diplôme Éducateur Spécialisé, Formation TEACCH',
  5,
  41
),

-- Lille et région
(
  'Hugo',
  'Fournier',
  'hugo.fournier@example.com',
  '06 01 23 45 67',
  'Lille Centre',
  50.6292,
  3.0573,
  'Spécialisé dans l''accompagnement des adolescents et jeunes adultes avec TSA vers l''insertion professionnelle.',
  'Insertion professionnelle, Autonomie, Habiletés sociales',
  'Diplôme Éducateur Technique Spécialisé',
  8,
  45
),

-- Nantes et région
(
  'Chloé',
  'Girard',
  'chloe.girard@example.com',
  '06 12 34 56 78',
  'Nantes Centre',
  47.2184,
  -1.5536,
  'Éducatrice passionnée par les approches sensorielles et la régulation émotionnelle chez les enfants avec TSA.',
  'Intégration sensorielle, Régulation émotionnelle, ABA',
  'Certification en Intégration Sensorielle, Formation ABA',
  7,
  44
),

-- Bordeaux et région
(
  'Nathan',
  'Bonnet',
  'nathan.bonnet@example.com',
  '06 23 45 67 89',
  'Bordeaux Chartrons',
  44.8572,
  -0.5633,
  'Accompagnement personnalisé et guidance parentale. Approche collaborative avec les familles.',
  'ABA, Guidance parentale, Intervention à domicile',
  'Master ABA, Formation Guidance Parentale',
  6,
  42
),

-- Strasbourg et région
(
  'Manon',
  'Garnier',
  'manon.garnier@example.com',
  '06 34 56 78 90',
  'Strasbourg Centre',
  48.5734,
  7.7521,
  'Spécialiste de la communication alternative et augmentée. Bilinguisme français-allemand.',
  'PECS, MAKATON, Communication alternative',
  'Certification PECS et MAKATON',
  5,
  40
),

-- Nice et région
(
  'Alexandre',
  'Faure',
  'alexandre.faure@example.com',
  '06 45 67 89 01',
  'Nice Ouest',
  43.7009,
  7.2511,
  'Éducateur spécialisé en activités physiques adaptées et développement psychomoteur pour enfants avec TSA.',
  'Psychomotricité, Activités physiques adaptées, ABA',
  'Master STAPS APA, Certification ABA',
  9,
  47
),

-- Rennes et région
(
  'Sarah',
  'Blanc',
  'sarah.blanc@example.com',
  '06 56 78 90 12',
  'Rennes Centre',
  48.1173,
  -1.6778,
  'Accompagnement des enfants avec autisme et troubles associés. Approche multidisciplinaire.',
  'TEACCH, ABA, Troubles du comportement alimentaire',
  'Diplôme Éducateur Spécialisé, Formation TEACCH et ABA',
  7,
  43
);

SELECT '✅ 15 profils d''éducateurs créés avec succès !' as status;

-- Vérifier les profils créés
SELECT
  first_name || ' ' || last_name as nom_complet,
  location,
  specialties,
  experience_years || ' ans' as experience,
  hourly_rate || '€/h' as tarif
FROM educator_profiles
WHERE user_id IS NULL
ORDER BY created_at DESC
LIMIT 15;
