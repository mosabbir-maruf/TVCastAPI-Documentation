import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const staticRoutes = ['/', '/testing', '/maintainer'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const lastModified = new Date();

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));
}

