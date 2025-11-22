const defaultSiteUrl = 'https://docs-tvcastapi.vercel.app';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl;

export const siteConfig = {
  name: 'TVCastAPI',
  description: 'A powerful RESTful API for TV Live channel streaming content',
  url: siteUrl,
  github: 'https://github.com/mosabbir-maruf/TVCastAPI',
};

