import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'PhiloGPT — Your Stoic Philosophy Guide',
  description:
    "A purpose-built Stoic philosophy chatbot drawing wisdom from Marcus Aurelius, Seneca, and Epictetus. Navigate life's challenges with ancient wisdom.",
  keywords: 'stoicism, stoic philosophy, marcus aurelius, seneca, epictetus, meditations, philosophy chatbot',
  openGraph: {
    title: 'PhiloGPT — Your Stoic Philosophy Guide',
    description: "Navigate life's challenges with the wisdom of Marcus Aurelius, Seneca, and Epictetus.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PhiloGPT — Stoic Philosophy Guide',
    description: 'Ancient wisdom for modern challenges.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
