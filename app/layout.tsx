import type { Metadata, Viewport } from 'next';
import { display, sans } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'DOSE | Natural energy, zero sugar',
  description:
    'DOSE is a zero sugar energy drink with natural caffeine, electrolytes, L-theanine and B vitamins. Four fruit-forward flavours, sweetened with monk fruit.',
  openGraph: {
    title: 'DOSE | Natural energy, zero sugar',
    description: 'Natural caffeine and electrolytes in one zero sugar can.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#141414',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
