import ProTheme from '@/components/ProTheme';

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
