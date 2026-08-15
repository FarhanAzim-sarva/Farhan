import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sarva Investor Intelligence Room',
  description: 'Private diligence workspace for Sarva leadership and approved advisors.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
