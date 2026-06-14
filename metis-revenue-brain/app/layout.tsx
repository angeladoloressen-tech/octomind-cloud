import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'METIS Revenue Brain',
  description: '48h AI sales automation setup for founders, creators, and small businesses.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
