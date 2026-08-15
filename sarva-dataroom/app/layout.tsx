import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sarva Investor Data Room',
  description: 'Private diligence workspace for Sarva',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
