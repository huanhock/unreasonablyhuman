import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UnreasonablyHuman',
  description: 'AI-Augmented Relationship Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-warm-bg)] text-[var(--color-warm-text)]`}>
        <main className="max-w-md mx-auto min-h-screen pb-36">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
