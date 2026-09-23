import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CRM — заявки',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-brand-beige/60">{children}</div>;
}
