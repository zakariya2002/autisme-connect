'use client';

import Link from 'next/link';

const articles = [
  {
    id: 1,
    slug: 'harcelement-scolaire',
    title: "Harcèlement scolaire et TSA : Comment protéger son enfant ?",
    excerpt: "Les enfants avec un trouble du spectre de l'autisme sont malheureusement plus exposés au harcèlement scolaire. Découvrez les signes à surveiller et les stratégies pour protéger votre enfant.",
    image: "/images/articles/harcelement.png",
    category: "Éducation",
    date: "15 décembre 2024",
    readTime: "8 min"
  },
  {
    id: 2,
    slug: 'nutrition',
    title: "Nutrition et autisme : Les bases d'une alimentation adaptée",
    excerpt: "L'alimentation peut jouer un rôle important dans le bien-être des personnes autistes. Découvrez les principes d'une nutrition adaptée et les aliments à privilégier.",
    image: "/images/articles/nutrition.png",
    category: "Santé",
    date: "10 décembre 2024",
    readTime: "6 min"
  },
  {
    id: 3,
    slug: 'activite-physique',
    title: "Sport et autisme : Les bienfaits de l'activité physique adaptée",
    excerpt: "L'activité physique offre de nombreux bénéfices pour les personnes avec TSA. Découvrez quels sports privilégier et comment adapter la pratique.",
    image: "/images/articles/sport.png",
    category: "Bien-être",
    date: "5 décembre 2024",
    readTime: "7 min"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/images/logo-neurocare.svg"
                alt="NeuroCare"
                className="h-8"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-gray-600 hover:text-teal-600 transition-colors">
                Trouver un professionnel
              </Link>
              <Link href="/blog" className="text-teal-600 font-medium">
                Blog
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-teal-600 transition-colors">
                Communauté
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4" style={{ backgroundColor: '#027e7e' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Blog NeuroCare
          </h1>
          <p className="text-xl text-teal-100">
            Ressources, conseils et actualités pour accompagner les personnes neuro-atypiques
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium" style={{ color: '#027e7e' }}>
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime} de lecture</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-2 font-medium" style={{ color: '#027e7e' }}>
                    Lire l'article
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Restez informé
          </h2>
          <p className="text-gray-600 mb-6">
            Recevez nos derniers articles et conseils directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              className="px-6 py-3 text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#027e7e' }}
            >
              S'abonner
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-500 text-sm">
        <p>© 2024 NeuroCare. Tous droits réservés.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/mentions-legales" className="hover:text-teal-600">Mentions légales</Link>
          <Link href="/politique-confidentialite" className="hover:text-teal-600">Confidentialité</Link>
        </div>
      </footer>
    </div>
  );
}
