import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MeritView',
  description: 'AI-powered dispute analysis — decision support, not legal advice.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
