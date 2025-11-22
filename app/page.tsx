import type { Metadata } from 'next';
import HomePage from '@/components/pages/home-page';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'TVCastAPI Documentation',
  description: 'Complete API reference and guides for TVCastAPI - TV Live channel streaming API.',
  path: '/',
  image: '/meta-home.jpeg', // Falls back to meta.jpeg if this file doesn't exist
});

export default function Page() {
  return <HomePage />;
}
