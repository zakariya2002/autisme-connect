'use client'

import Link from 'next/link'

export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-violet-600 hover:text-violet-700 font-semibold text-xl">
            ← NeuroCare
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                NeuroCare accorde une grande importance à la protection de vos données personnelles.
                Cette politique de confidentialité vous informe sur la manière dont nous collectons,
                utilisons et protégeons vos informations conformément au Règlement Général sur la
                Protection des Données (RGPD).
              </p>
              <p>
                <strong>Responsable du traitement :</strong> NeuroCare<br />
                <strong>Email :</strong> contact@neuro-care.fr
              </p>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
            <div className="text-gray-600 space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Pour les familles :</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone (optionnel)</li>
                  <li>Ville et code postal</li>
                  <li>Informations sur les enfants (prénom, âge, besoins spécifiques)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Pour les éducateurs :</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse professionnelle</li>
                  <li>Diplômes et certifications</li>
                  <li>Expérience professionnelle</li>
                  <li>Photo de profil (optionnel)</li>
                  <li>CV (optionnel)</li>
                  <li>Tarifs et disponibilités</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Données de connexion :</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Date et heure de connexion</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Finalités */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalités du traitement</h2>
            <div className="text-gray-600 space-y-3">
              <p>Vos données sont collectées pour les finalités suivantes :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Mise en relation :</strong> Permettre aux familles de trouver des éducateurs spécialisés</li>
                <li><strong>Gestion des comptes :</strong> Création et gestion de votre espace personnel</li>
                <li><strong>Messagerie :</strong> Communication entre familles et éducateurs</li>
                <li><strong>Prise de rendez-vous :</strong> Gestion des rendez-vous entre utilisateurs</li>
                <li><strong>Paiement :</strong> Traitement des abonnements pour les éducateurs</li>
                <li><strong>Vérification :</strong> Validation des diplômes et certifications des éducateurs</li>
                <li><strong>Support :</strong> Répondre à vos demandes d'assistance</li>
                <li><strong>Amélioration :</strong> Améliorer nos services et l'expérience utilisateur</li>
              </ul>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Base légale du traitement</h2>
            <div className="text-gray-600 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Consentement :</strong> Lors de votre inscription, vous consentez au traitement de vos données</li>
                <li><strong>Exécution du contrat :</strong> Le traitement est nécessaire pour fournir nos services</li>
                <li><strong>Intérêt légitime :</strong> Amélioration de nos services et sécurité de la plateforme</li>
                <li><strong>Obligation légale :</strong> Conservation des données de facturation</li>
              </ul>
            </div>
          </section>

          {/* Destinataires */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Destinataires des données</h2>
            <div className="text-gray-600 space-y-3">
              <p>Vos données peuvent être partagées avec :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Autres utilisateurs :</strong> Selon vos paramètres de confidentialité (profil public)</li>
                <li><strong>Stripe :</strong> Pour le traitement des paiements (données bancaires)</li>
                <li><strong>Supabase :</strong> Hébergement sécurisé des données</li>
                <li><strong>Vercel :</strong> Hébergement du site web</li>
                <li><strong>Resend :</strong> Envoi d'emails transactionnels</li>
              </ul>
              <p className="mt-4">
                <strong>Nous ne vendons jamais vos données personnelles à des tiers.</strong>
              </p>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Durée de conservation</h2>
            <div className="text-gray-600 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Données de compte :</strong> Conservées tant que le compte est actif, puis supprimées sous 30 jours après demande de suppression</li>
                <li><strong>Messages :</strong> Conservés 3 ans après la dernière activité</li>
                <li><strong>Données de facturation :</strong> Conservées 10 ans (obligation légale)</li>
                <li><strong>Logs de connexion :</strong> Conservés 12 mois</li>
              </ul>
            </div>
          </section>

          {/* Droits des utilisateurs */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Vos droits</h2>
            <div className="text-gray-600 space-y-3">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit à la limitation :</strong> Limiter le traitement de vos données</li>
                <li><strong>Droit de retirer votre consentement :</strong> À tout moment</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@neuro-care.fr" className="text-violet-600 hover:underline">contact@neuro-care.fr</a>
              </p>
              <p>
                Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">www.cnil.fr</a>
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Sécurité des données</h2>
            <div className="text-gray-600 space-y-3">
              <p>Nous mettons en œuvre les mesures de sécurité suivantes :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Chiffrement des données au repos</li>
                <li>Authentification sécurisée</li>
                <li>Row Level Security (RLS) pour l'isolation des données</li>
                <li>Sauvegardes régulières</li>
                <li>Accès restreint aux données personnelles</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
            <div className="text-gray-600 space-y-3">
              <p>Notre site utilise des cookies strictement nécessaires au fonctionnement :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Cookies de session :</strong> Pour maintenir votre connexion</li>
                <li><strong>Cookies d'authentification :</strong> Pour sécuriser votre compte</li>
              </ul>
              <p className="mt-4">
                Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.
              </p>
            </div>
          </section>

          {/* Transfert hors UE */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Transfert de données hors UE</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                Certains de nos prestataires (Vercel, Stripe, Supabase) peuvent traiter des données
                en dehors de l'Union Européenne. Dans ce cas, nous nous assurons que des garanties
                appropriées sont en place (clauses contractuelles types, certification Privacy Shield
                pour les USA, etc.).
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modifications</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                En cas de modification substantielle, nous vous en informerons par email ou via une
                notification sur le site.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles,
                contactez-nous à : <a href="mailto:contact@neuro-care.fr" className="text-violet-600 hover:underline">contact@neuro-care.fr</a>
              </p>
            </div>
          </section>

          {/* Date de mise à jour */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Dernière mise à jour : 30 novembre 2024
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/mentions-legales" className="text-violet-600 hover:underline">
            Mentions légales
          </Link>
          <Link href="/cgu" className="text-violet-600 hover:underline">
            Conditions générales d'utilisation
          </Link>
        </div>
      </main>
    </div>
  )
}
