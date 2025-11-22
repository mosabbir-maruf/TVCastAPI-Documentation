import type { Metadata } from 'next';
import '@/styles/globals.css';
import { siteConfig } from '@/config/site';
import { defaultOgImage } from '@/lib/metadata';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'TVCastAPI Documentation',
    template: '%s | TVCastAPI',
  },
  description:
    'Complete API documentation for TVCastAPI - A powerful RESTful API for TV Live channel streaming with categories, search, and streaming links',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'TVCastAPI Documentation',
    description: 'A powerful RESTful API for TV Live channel streaming',
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'TVCastAPI Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TVCastAPI Documentation',
    description: 'A powerful RESTful API for TV Live channel streaming',
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body>{children}</body>
    </html>
  );
}

