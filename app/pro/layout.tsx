import type { Metadata } from 'next'
import ProTheme from '@/components/ProTheme';

export const metadata: Metadata = {
  title: 'Espace Professionnels | NeuroCare',
  description: 'Rejoignez NeuroCare en tant que professionnel du neurodéveloppement. Développez votre activité, trouvez de nouvelles familles et gérez vos rendez-vous facilement.',
  openGraph: {
    title: 'Espace Professionnels | NeuroCare',
    description: 'Rejoignez NeuroCare en tant que professionnel. Développez votre activité et trouvez de nouvelles familles.',
    url: 'https://neuro-care.fr/pro',
  },
  alternates: {
    canonical: 'https://neuro-care.fr/pro',
  },
}

export default function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProTheme />
      {children}
    </>
  );
}
