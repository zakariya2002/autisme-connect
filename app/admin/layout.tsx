import { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Administration | NeuroCare',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
