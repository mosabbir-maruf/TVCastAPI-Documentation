import type { Metadata } from 'next';
import TestingPage from '@/components/pages/testing-page';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'API Testing Playground',
  description: 'Interactive REST client to explore every TVCastAPI endpoint with your own base URL.',
  path: '/testing',
  image: '/meta-testing.jpeg', // Falls back to meta.jpeg if this file doesn't exist
});

export default function Page() {
  return <TestingPage />;
}
