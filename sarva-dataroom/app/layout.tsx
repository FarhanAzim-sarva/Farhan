import './globals.css';
import './brand.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sarva Private Company Workspace',
  description: 'Private operating system, tracker suite and diligence room for Sarva leadership and approved advisors.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
