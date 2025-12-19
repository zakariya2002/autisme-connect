'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { professions } from '@/lib/professions-config';
import CommunityPreview from '@/components/community/CommunityPreview';

// Types de suggestions pour la recherche
type SuggestionType = 'profession' | 'city' | 'tnd';

interface SearchSuggestion {
  type: SuggestionType;
  label: string;
  value: string;
  icon: string;
}

// Liste des TNDs/Spécialisations
const tndList = [
  { label: 'Troubles du spectre autistique (TSA)', value: 'TSA' },
  { label: 'Autisme', value: 'autisme' },
  { label: 'TDAH', value: 'TDAH' },
  { label: 'Troubles DYS', value: 'DYS' },
  { label: 'Dyslexie', value: 'dyslexie' },
  { label: 'Dyspraxie', value: 'dyspraxie' },
  { label: 'Troubles du comportement', value: 'comportement' },
  { label: 'Habiletés sociales', value: 'habiletes-sociales' },
  { label: 'Intégration sensorielle', value: 'sensoriel' },
  { label: 'Communication alternative (PECS, Makaton)', value: 'communication' },
  { label: 'Méthode ABA', value: 'ABA' },
  { label: 'Méthode TEACCH', value: 'TEACCH' },
  { label: 'Guidance parentale', value: 'guidance-parentale' },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'educator' | 'family' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setUserType(null);
      } else if (session?.user) {
        setUser(session.user);
        checkUserType(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserType = async (userId: string) => {
    const { data: educator } = await supabase
      .from('educator_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (educator) {
      setUserType('educator');
    } else {
      setUserType('family');
    }
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      checkUserType(session.user.id);
    } else {
      setUser(null);
      setUserType(null);
    }
  };

  const getDashboardLink = () => {
    if (userType === 'educator') return '/dashboard/educator';
    if (userType === 'family') return '/dashboard/family';
    return '/auth/login';
  };

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche de suggestions
  const searchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    const queryLower = query.toLowerCase();
    const results: SearchSuggestion[] = [];

    // 1. Rechercher dans les professions
    professions.forEach(prof => {
      if (prof.label.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'profession',
          label: prof.label,
          value: prof.value,
          icon: '👨‍⚕️'
        });
      }
    });

    // 2. Rechercher dans les TNDs/Spécialisations
    tndList.forEach(tnd => {
      if (tnd.label.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'tnd',
          label: tnd.label,
          value: tnd.value,
          icon: '🧠'
        });
      }
    });

    // 3. Rechercher les villes via l'API
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=municipality`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        data.features.forEach((feature: any) => {
          results.push({
            type: 'city',
            label: feature.properties.label,
            value: feature.properties.label,
            icon: '📍'
          });
        });
      }
    } catch (error) {
      console.error('Erreur recherche ville:', error);
    }

    setSuggestions(results.slice(0, 8));
    setShowSuggestions(results.length > 0);
    setIsSearching(false);
  };

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchSuggestions(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sélection d'une suggestion
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');

    // Rediriger vers la page recherche avec le bon filtre
    switch (suggestion.type) {
      case 'profession':
        router.push(`/search?profession=${encodeURIComponent(suggestion.value)}`);
        break;
      case 'city':
        router.push(`/search?location=${encodeURIComponent(suggestion.value)}`);
        break;
      case 'tnd':
        router.push(`/search?specialization=${encodeURIComponent(suggestion.label)}`);
        break;
    }
  };

  // Recherche directe (entrée)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Articles pour le carrousel
  const articles = [
    {
      id: 1,
      title: "Le harcèlement scolaire pour les enfants souffrant d'un handicap",
      image: "/images/articles/harcelement.png",
      link: "/blog/harcelement-scolaire"
    },
    {
      id: 2,
      title: "La nutrition un allié pour le développement",
      image: "/images/articles/nutrition.png",
      link: "/blog/nutrition"
    },
    {
      id: 3,
      title: "Les bienfaits de l'activité physique adaptée",
      image: "/images/articles/sport.png",
      link: "/blog/activite-physique"
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#027e7e' }}>
        <div className="flex items-center justify-between px-4 py-4">
          {/* Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-white"
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo centré */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2" aria-label="Retour à l'accueil NeuroCare">
            <img
              src="/images/logo-neurocare.svg"
              alt="NeuroCare - Plateforme de mise en relation avec des professionnels du neurodéveloppement"
              className="h-20"
            />
          </Link>

          {/* Espace vide pour équilibrer */}
          <div className="w-8"></div>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
            <nav className="px-4 py-4 space-y-1" role="navigation" aria-label="Menu principal">
              <Link
                href="/search"
                className="block py-3 font-medium text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rechercher un professionnel
              </Link>
              <Link
                href="/about"
                className="block py-3 font-medium text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                href="/familles/aides-financieres"
                className="block py-3 font-medium text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Aides financières
              </Link>
              <Link
                href="/contact"
                className="block py-3 font-medium text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/pro"
                className="block py-3 px-4 rounded-xl font-semibold text-center my-3"
                style={{ backgroundColor: '#f3e8ff', color: '#41005c' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Vous êtes professionnel ?
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-3 py-3 font-medium text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </Link>
              <Link
                href="/community"
                className="flex items-center gap-3 py-3 font-medium text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Communauté
              </Link>
              {user ? (
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl font-semibold text-white mt-3"
                  style={{ backgroundColor: '#027e7e' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Mon tableau de bord
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-3 px-4 text-white rounded-xl text-center font-semibold mt-3"
                    style={{ backgroundColor: '#f0879f' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block py-3 px-4 text-white rounded-xl text-center font-semibold mt-2"
                    style={{ backgroundColor: '#027e7e' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[280px] sm:h-[350px]">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center"></div>
        </div>


        {/* Contenu */}
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-medium mb-6 max-w-md leading-relaxed">
            Trouvez le professionnel idéal pour accompagner votre enfant
          </h1>

          {/* Barre de recherche */}
          <div className="w-full max-w-md relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} role="search" aria-label="Recherche de professionnels">
              <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Profession, ville ou TND..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="flex-1 px-5 py-3 text-gray-700 outline-none"
                  aria-label="Rechercher un professionnel par profession, ville ou trouble neurodéveloppemental"
                  aria-autocomplete="list"
                  aria-controls={showSuggestions ? "search-suggestions" : undefined}
                  aria-expanded={showSuggestions}
                />
                <button type="submit" className="px-4 py-3 text-gray-400 hover:text-teal-600 transition-colors" aria-label="Lancer la recherche">
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin" role="status" aria-label="Recherche en cours"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {/* Dropdown des suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div id="search-suggestions" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50" role="listbox" aria-label="Suggestions de recherche">
                <div className="max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${index}`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                      role="option"
                      aria-label={`${suggestion.label} - ${suggestion.type === 'profession' ? 'Profession' : suggestion.type === 'city' ? 'Ville' : 'Spécialisation / TND'}`}
                    >
                      <span className="text-xl" aria-hidden="true">{suggestion.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">{suggestion.label}</p>
                        <p className="text-xs text-gray-500">
                          {suggestion.type === 'profession' && 'Profession'}
                          {suggestion.type === 'city' && 'Ville'}
                          {suggestion.type === 'tnd' && 'Spécialisation / TND'}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Professionnels de confiance */}
      <section className="py-10 px-6" aria-labelledby="section-professionnels">
        <h2 id="section-professionnels" className="text-2xl sm:text-3xl font-bold text-center mb-2" style={{ color: '#027e7e' }}>
          Des professionnels de confiance
        </h2>
        {/* Petite barre décorative */}
        <div className="flex justify-center mb-6" aria-hidden="true">
          <div className="w-80 h-[1px] bg-gray-300"></div>
        </div>

        {/* Icône professionnels */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/icons/pro-badge.svg"
            alt="Badge de vérification des professionnels - Tous nos professionnels sont vérifiés"
            className="w-20 h-20 object-contain"
          />
        </div>

        <p className="text-gray-600 text-center text-lg sm:text-xl max-w-md mx-auto mb-4 leading-relaxed">
          Nous savons à quel point le choix d'un professionnel peut s'avérer compliqué.
        </p>

        <p className="text-gray-600 text-center text-lg sm:text-xl max-w-md mx-auto mb-8 leading-relaxed">
          Sur <span className="font-bold text-gray-800">NeuroCare</span> tous les professionnels sont soigneusement sélectionnés et vérifiés pour répondre à vos besoins.
        </p>

        {/* Logos des organismes de vérification */}
        <div className="flex justify-center items-center gap-8 flex-wrap" role="list" aria-label="Organismes de vérification">
          {/* RPPS / Annuaire Santé */}
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border border-gray-100" role="listitem">
            <img
              src="/images/logos/rpps-logo.svg"
              alt="RPPS - Répertoire Partagé des Professionnels de Santé"
              className="w-full h-full object-cover"
            />
          </div>
          {/* ARS */}
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border border-gray-100" role="listitem">
            <img
              src="/images/logos/ars-logo.svg"
              alt="ARS - Agence Régionale de Santé"
              className="w-full h-full object-cover"
            />
          </div>
          {/* France Compétences / RNCP */}
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border border-gray-100" role="listitem">
            <img
              src="/images/logos/france-competences-logo.svg"
              alt="France Compétences - Certification professionnelle"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section Articles - Carrousel */}
      <section className="py-8 px-4 sm:px-0" aria-labelledby="section-articles">
        <h2 id="section-articles" className="sr-only">Articles et ressources</h2>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pl-4 pr-6 sm:px-8 lg:px-16 pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          role="region"
          aria-label="Carrousel d'articles"
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              href={article.link}
              className="flex-shrink-0 w-[48%] sm:w-[32%] lg:w-[24%] snap-start"
              aria-label={`Lire l'article: ${article.title}`}
            >
              <div className="relative h-36 sm:h-44 lg:h-52 rounded-2xl overflow-hidden shadow-lg">
                {/* Image placeholder - à remplacer */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${article.image}')` }}
                  ></div>
                </div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                {/* Titre */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white text-sm font-semibold leading-tight line-clamp-3">
                    {article.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link href="/blog" className="font-medium underline" style={{ color: '#027e7e' }}>
            Voir tous les articles
          </Link>
        </div>
      </section>

      {/* Section Nos engagements */}
      <section className="py-10 px-6 text-center" aria-labelledby="section-engagements">
        <h2 id="section-engagements" className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#027e7e', fontFamily: 'Verdana, sans-serif' }}>
          Nos engagements
        </h2>
        <p className="text-xl sm:text-2xl font-medium mb-2" style={{ color: '#E8747C', fontFamily: "'Open Sans', sans-serif" }}>
          Confidentialité et sécurité
        </p>
        {/* Petite barre décorative */}
        <div className="flex justify-center mb-6" aria-hidden="true">
          <div className="w-80 h-[1px] bg-gray-300"></div>
        </div>

        <p className="text-gray-600 max-w-sm mx-auto mb-6 leading-relaxed">
          Vos données personnelles sont protégées. Nous garantissons des échanges sécurisés et une totale transparence.
        </p>

        {/* Icône poignée de main */}
        <div className="flex justify-center">
          <img
            src="/images/icons/handshake-badge.svg"
            alt="Symbole de confiance et engagement - Nous nous engageons à protéger vos données"
            className="w-20 h-20 object-contain"
          />
        </div>
      </section>

      {/* Section Aide financière */}
      <section className="px-4 py-8" aria-labelledby="section-aide-financiere">
        <div className="bg-teal-600 rounded-3xl p-6 text-center text-white max-w-md mx-auto">
          <h2 id="section-aide-financiere" className="text-xl font-bold mb-1">
            Aide financière
          </h2>
          <p className="text-teal-100 mb-4">
            Quels sont mes droits ?
          </p>

          <p className="text-sm text-teal-50 mb-6 leading-relaxed">
            Plusieurs aides existent pour financer l'accompagnement de votre proche. Chèque CESU, AEEH, PCH, ... consulter votre éligibilité.
          </p>

          <Link
            href="/familles/aides-financieres"
            className="inline-block bg-[#E8747C] hover:bg-[#d65f67] text-white font-semibold px-6 py-3 rounded-full transition-colors"
            aria-label="Accéder au simulateur d'aides financières"
          >
            Simulateur d'aide
          </Link>
        </div>
      </section>

      {/* Section Communauté */}
      <CommunityPreview />

      {/* Section Vous êtes aidants / professionnel */}
      <section className="py-10 px-4" aria-labelledby="section-cta">
        <h2 id="section-cta" className="sr-only">Rejoignez NeuroCare</h2>
        <div className="max-w-lg mx-auto space-y-6">
          {/* Card Aidants */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(2, 126, 126, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: '#027e7e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Vous êtes aidants ?</h3>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#027e7e' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Trouvez des professionnels qualifiés près de chez vous</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#027e7e' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Consultez leurs profils et compétences</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#027e7e' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Échangez en toute confiance</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#027e7e' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">100% gratuit, sans engagement</span>
              </li>
            </ul>

            <Link
              href="/search"
              className="block w-full text-center text-white font-semibold py-3.5 rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: '#027e7e' }}
            >
              Commencer ma recherche
            </Link>
          </div>

          {/* Card Professionnels */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(65, 0, 92, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: '#41005c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Vous êtes un professionnel ?</h3>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#41005c' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Valorisez votre expertise et vos diplômes</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#41005c' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Développez votre activité à votre rythme</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#41005c' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Gagnez du temps sur l'administratif</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#41005c' }}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Gérez vos revenus facilement</span>
              </li>
            </ul>

            <Link
              href="/pro/pricing"
              className="block w-full text-center text-white font-semibold py-3.5 rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: '#41005c' }}
            >
              Découvrir les offres
            </Link>
          </div>
        </div>
      </section>

      {/* Footer complet */}
      <footer className="text-white py-12 px-6" style={{ backgroundColor: '#027e7e' }} role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Logo et description */}
            <div>
              <Link href="/" className="inline-block mb-4" aria-label="Retour à l'accueil NeuroCare">
                <img
                  src="/images/logo-neurocare.svg"
                  alt="Logo NeuroCare"
                  className="h-20 brightness-0 invert"
                />
              </Link>
              <p className="text-sm leading-relaxed text-teal-100">
                La plateforme qui connecte les familles avec des professionnels du neurodéveloppement vérifiés et qualifiés.
              </p>
            </div>

            {/* Navigation */}
            <nav aria-labelledby="footer-nav-1">
              <h3 id="footer-nav-1" className="font-bold text-white mb-4">Navigation</h3>
              <ul className="space-y-2 text-sm text-teal-100">
                <li><Link href="/search" className="hover:text-white transition-colors">Trouver un professionnel</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </nav>

            {/* Familles */}
            <nav aria-labelledby="footer-nav-2">
              <h3 id="footer-nav-2" className="font-bold text-white mb-4">Familles</h3>
              <ul className="space-y-2 text-sm text-teal-100">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link href="/familles/aides-financieres" className="hover:text-white transition-colors">Aides financières</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </nav>

            {/* Professionnels */}
            <nav aria-labelledby="footer-nav-3">
              <h3 id="footer-nav-3" className="font-bold text-white mb-4">Professionnels</h3>
              <ul className="space-y-2 text-sm text-teal-100">
                <li><Link href="/pro" className="hover:text-white transition-colors">Espace Pro</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Rejoindre neurocare</Link></li>
              </ul>
            </nav>
          </div>

          {/* Séparateur */}
          <div className="border-t border-teal-500 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Liens légaux */}
              <nav aria-label="Informations légales">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-teal-100">
                  <Link href="/mentions-legales" className="hover:text-white transition-colors" aria-label="Consulter les mentions légales">
                    Mentions légales
                  </Link>
                  <Link href="/politique-confidentialite" className="hover:text-white transition-colors" aria-label="Consulter la politique de confidentialité et RGPD">
                    Politique de confidentialité
                  </Link>
                  <Link href="/cgu" className="hover:text-white transition-colors" aria-label="Consulter les conditions générales d'utilisation">
                    CGU
                  </Link>
                </div>
              </nav>

              {/* Copyright */}
              <p className="text-sm text-teal-200">
                © 2024 neurocare. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
