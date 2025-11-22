import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

const baseUrl = siteConfig.url.replace(/\/$/, '');
const fallbackOgImage = `${baseUrl}/meta.jpeg`;

type MetadataOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string; // Optional per-page OG image, falls back to meta.jpeg
};

export const buildPageMetadata = ({ title, description, path = '/', image }: MetadataOptions): Metadata => {
  const canonicalUrl = `${baseUrl}${path === '/' ? '' : path}`;
  
  // If image is specified, use the API route for automatic fallback
  // Otherwise, use the fallback image directly
  let ogImage: string;
  if (image) {
    // Extract page name from image path (e.g., '/meta-home.jpeg' -> 'home')
    const pageMatch = image.match(/meta-([^.]+)\./);
    const pageName = pageMatch ? pageMatch[1] : path.replace(/^\//, '').replace(/\//g, '-') || 'home';
    ogImage = `${baseUrl}/api/og-image?page=${pageName}`;
  } else {
    ogImage = fallbackOgImage;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
};

export const defaultOgImage = fallbackOgImage;

