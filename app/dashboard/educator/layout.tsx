import ProTheme from '@/components/ProTheme';

export default function EducatorDashboardLayout({
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
