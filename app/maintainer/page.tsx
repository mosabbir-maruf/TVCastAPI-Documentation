import type { Metadata } from 'next';
import MaintainerPage from '@/components/pages/maintainer-page';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Maintainer & Support',
  description: 'Get in touch with the TVCastAPI maintainer for integration help, bug reports, or roadmap discussions.',
  path: '/maintainer',
  image: '/meta-maintainer.jpeg', // Falls back to meta.jpeg if this file doesn't exist
});

export default function Page() {
  return <MaintainerPage />;
}
