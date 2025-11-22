'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Book,
  Home,
  Search,
  Film,
  PlayCircle,
  Server,
  Code2,
  Zap,
  Shield,
  Database,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import { Pattern } from '@/components/ui/pattern';
import { OnThisPageNav } from '@/components/privacy/on-this-page-nav';
import { CodeBlock } from '@/components/ui/code-block';
import { siteConfig } from '@/config/site';
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import { MobileHeader } from '@/components/ui/mobile-header';
import { SupportButton } from '@/components/ui/support-button';

const navSections = [
  {
    heading: 'Getting Started',
    links: [
      { id: 'overview', label: 'Overview' },
      { id: 'features', label: 'Key Features' },
      { id: 'installation', label: 'Installation' },
      { id: 'environment-variables', label: 'Environment Variables', hasSubItems: true },
      { id: 'backend-env', label: 'Backend', isSubItem: true, parentId: 'environment-variables' },
      { id: 'frontend-env', label: 'Frontend', isSubItem: true, parentId: 'environment-variables' },
    ],
  },
  {
    heading: 'Core Endpoints',
    links: [
      { id: 'home', label: 'Home Page' },
      { id: 'channel-details', label: 'Channel Details' },
      { id: 'channels-by-category', label: 'Channels by Category' },
    ],
  },
  {
    heading: 'Search & Streaming',
    links: [
      { id: 'search', label: 'Search Channels' },
      { id: 'servers', label: 'Channel Servers' },
      { id: 'streaming', label: 'Stream URL' },
    ],
  },
  {
    heading: 'Deployment',
    links: [
      { id: 'deployment', label: 'Deployment' },
    ],
  },
];

const navLinks = navSections.flatMap((section) => section.links);

const leftNavGroups = [
  {
    heading: null,
    links: [
      { label: 'Documentation', href: '/', current: true },
      { label: 'API Testing', href: '/testing' },
      { label: 'Maintainer', href: '/maintainer' },
      { label: 'GitHub Repository', href: siteConfig.github, external: true },
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      { label: 'Installation', href: '#installation' },
      { label: 'Environment Variables', href: '#environment-variables' },
      { label: 'Backend', href: '#backend-env', subItem: true },
      { label: 'Frontend', href: '#frontend-env', subItem: true },
      { label: 'API Endpoints', href: '#home' },
    ],
  },
];

const features = [
  {
    title: 'No Authentication Required',
    description: 'Access TV channel data without registration or API keys. Just deploy and use.',
    icon: Shield,
  },
  {
    title: 'Redis Caching',
    description: 'Optional Redis caching for improved performance with 24-hour cache for homepage data.',
    icon: Database,
  },
  {
    title: 'Multiple Categories',
    description: 'Access channels organized by categories: trending, sports, news, documentary, kids, and islamic.',
    icon: Film,
  },
  {
    title: 'Rate Limiting',
    description: 'Built-in rate limiting to prevent abuse and ensure fair usage for all users.',
    icon: Zap,
  },
  {
    title: 'Fast & Reliable',
    description: 'Optimized scraping with caching and error handling for consistent performance.',
    icon: Clock,
  },
  {
    title: 'Comprehensive Data',
    description: 'Get detailed channel info, streaming URLs, server options, and category listings.',
    icon: Book,
  },
];

export default function DocumentationPage() {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [envVarsExpanded, setEnvVarsExpanded] = useState(false);

  return (
    <div className="relative isolate bg-background">
      {/* Mobile Header */}
      <MobileHeader
        onLeftMenuClick={() => setLeftDrawerOpen(true)}
        onRightMenuClick={() => setRightDrawerOpen(true)}
      />

      {/* Left Drawer - Navigation */}
      <MobileDrawer
        isOpen={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        position="left"
      >
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setLeftDrawerOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">{siteConfig.name}</p>
              <p className="text-muted-foreground text-xs">API Documentation</p>
            </div>
          </Link>
          <nav className="space-y-5 text-sm">
            {leftNavGroups.map((group, index) => (
              <div
                key={group.heading ?? `group-${index}`}
                className={`space-y-2 ${index !== 0 ? 'border-t border-border pt-5' : ''}`}
              >
                {group.heading && (
                  <p className="font-semibold text-xs uppercase tracking-wide">{group.heading}</p>
                )}
                <div className="flex flex-col gap-0.5 text-muted-foreground">
                  {group.links.map((link) => {
                    if (link.label === 'Environment Variables') {
                      return (
                        <div key={link.label} className="flex flex-col gap-0.5">
                          <button
                            onClick={() => setEnvVarsExpanded(!envVarsExpanded)}
                            className="w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {link.label}
                          </button>
                          {envVarsExpanded && (
                            <>
                              {group.links
                                .filter((l) => 'subItem' in l && l.subItem)
                                .map((subLink) => (
                                  <Link
                                    key={subLink.label}
                                    href={subLink.href}
                                    className="ml-6 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground border-l-2 border-border/50 pl-3"
                                    onClick={() => setLeftDrawerOpen(false)}
                                  >
                                    {subLink.label}
                                  </Link>
                                ))}
                            </>
                          )}
                        </div>
                      );
                    }
                    if ('subItem' in link && link.subItem) {
                      return null; // Sub-items are rendered under Environment Variables
                    }
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        target={'external' in link && link.external ? '_blank' : undefined}
                        rel={'external' in link && link.external ? 'noreferrer' : undefined}
                        onClick={() => setLeftDrawerOpen(false)}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <SupportButton onClick={() => setLeftDrawerOpen(false)} />
        </div>
      </MobileDrawer>

      {/* Right Drawer - On This Page */}
      <MobileDrawer
        isOpen={rightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        position="right"
      >
        <OnThisPageNav links={navLinks} />
      </MobileDrawer>

      <Pattern variant="dots" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70">
        <div className="absolute left-1/2 top-[-10%] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 translate-x-1/3 rounded-full bg-[#8b5cf6]/20 blur-[150px]" />
        <div className="absolute bottom-[-15%] left-0 h-64 w-64 -translate-x-1/3 rounded-full bg-emerald-400/15 blur-[120px]" />
      </div>

      <section className="mx-auto flex w-full max-w-[1600px] items-start gap-4 px-4 py-8 sm:py-12 md:py-16 lg:px-0">
        {/* Left Sidebar */}
        <aside className="sticky top-24 z-10 hidden w-64 shrink-0 self-start lg:block">
          <div className="max-h-[calc(100vh-96px)] space-y-6 overflow-y-auto rounded-2xl border bg-background/70 p-6 shadow-xl shadow-black/5 backdrop-blur">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">{siteConfig.name}</p>
                <p className="text-muted-foreground text-xs">API Documentation</p>
              </div>
            </Link>
            <nav className="space-y-5 text-sm">
              {leftNavGroups.map((group, index) => (
                <div
                  key={group.heading ?? `group-${index}`}
                  className={`space-y-2 ${index !== 0 ? 'border-t border-border pt-5' : ''}`}
                >
                  {group.heading && (
                    <p className="font-semibold text-xs uppercase tracking-wide">{group.heading}</p>
                  )}
                  <div className="flex flex-col gap-0.5 text-muted-foreground">
                    {group.links.map((link) => {
                      if (link.label === 'Environment Variables') {
                        return (
                          <div key={link.label}>
                            <button
                              onClick={() => setEnvVarsExpanded(!envVarsExpanded)}
                              className="w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {link.label}
                            </button>
                            {envVarsExpanded && (
                              <>
                                {group.links
                                  .filter((l) => 'subItem' in l && l.subItem)
                                  .map((subLink) => (
                                    <Link
                                      key={subLink.label}
                                      href={subLink.href}
                                      className="ml-6 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground border-l-2 border-border/50 pl-3"
                                    >
                                      {subLink.label}
                                    </Link>
                                  ))}
                              </>
                            )}
                          </div>
                        );
                      }
                      if ('subItem' in link && link.subItem) {
                        return null; // Sub-items are rendered under Environment Variables
                      }
                      return (
                      <Link
                        key={link.label}
                        href={link.href}
                          className="rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        target={'external' in link && link.external ? '_blank' : undefined}
                        rel={'external' in link && link.external ? 'noreferrer' : undefined}
                      >
                        {link.label}
                      </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <SupportButton />
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 space-y-8 sm:space-y-10 md:space-y-12 min-w-0 w-full max-w-full overflow-hidden">
          {/* Header */}
          <header className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border bg-background/70 p-4 sm:p-6 md:p-8 shadow-lg shadow-black/5 backdrop-blur w-full max-w-full overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              REST API Documentation
            </p>
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight break-words">TVCastAPI</h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg break-words">
                A powerful RESTful API for fetching TV Live channel content. Get channel details,
                streaming links, categories, and search functionality. Designed for developers
                building TV streaming platforms.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-6 text-xs sm:text-sm text-muted-foreground w-full max-w-full">
              <div className="min-w-0 flex flex-col flex-shrink-0 overflow-hidden">
                <p className="text-[10px] sm:text-xs uppercase tracking-wide truncate">Version</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">v1.0</p>
              </div>
              <div className="min-w-0 flex flex-col flex-shrink-0 overflow-hidden">
                <p className="text-[10px] sm:text-xs uppercase tracking-wide truncate">Base URL</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm break-all">/api/v1</p>
              </div>
              <div className="min-w-0 flex flex-col flex-shrink-0 overflow-hidden">
                <p className="text-[10px] sm:text-xs uppercase tracking-wide truncate">Format</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">JSON</p>
              </div>
              <div className="min-w-0 flex flex-col flex-shrink-0 overflow-hidden">
                <p className="text-[10px] sm:text-xs uppercase tracking-wide truncate">API Endpoints</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">7</p>
              </div>
              <div className="min-w-0 flex flex-col flex-shrink-0 overflow-hidden">
                <p className="text-[10px] sm:text-xs uppercase tracking-wide truncate">Development Maintained</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">Yes</p>
              </div>
            </div>
          </header>


          {/* Overview */}
          <section id="overview" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Book className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Overview</h2>
            </div>
            <p className="text-muted-foreground">
              TVCastAPI is a RESTful API that utilizes web scraping to fetch TV Live channel content.
              It provides endpoints to retrieve channel details, categories, streaming links, and search
              functionality for TV channels.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-amber-50 p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold">⚠️ Important Notes</h3>
              <ul className="mt-3 sm:mt-4 list-disc space-y-2 pl-4 sm:pl-5 text-xs sm:text-sm text-muted-foreground">
                <li>
                  This is an <strong>unofficial API</strong> and is in no way officially related to any TV streaming service.
                </li>
                <li>
                  The content provided by this API is not hosted by us. All content belongs to their
                  respective owners. This API just demonstrates how to build an API that scrapes websites and uses their content.
                </li>
                <li>
                  This API is <strong>open</strong> and does not require an API key for authentication (unless configured).
                </li>
                <li>
                  It is recommended to deploy your own instance for personal use by customizing the API as needed.
                </li>
              </ul>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Key Features</h2>
            </div>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="absolute inset-x-4 top-4 h-16 rounded-2xl bg-gradient-to-r from-primary/15 via-transparent to-transparent opacity-0 blur-2xl transition group-hover:opacity-100" />
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <h3 className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Installation */}
          <section id="installation" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Code2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Installation</h2>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold">Prerequisites</h3>
                <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
                  Make sure you have the latest LTS release of Node.js (which includes npm).
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Local Setup</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold mb-2">1. Clone the repository</p>
                    <CodeBlock code={`git clone https://github.com/mosabbir-maruf/TVCastAPI.git\ncd TVCastAPI`} />
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-semibold mb-2">2. Navigate to backend directory</p>
                    <CodeBlock code='cd "TVCastAPI"' />
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-semibold mb-2">3. Install dependencies</p>
                    <CodeBlock code="npm install" />
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-semibold mb-2">4. Start the server</p>
                    <CodeBlock code="npm run dev" />
                    <p className="text-muted-foreground text-xs sm:text-sm mt-2">
                      Server will run on{' '}
                      <code className="rounded bg-muted px-1 py-0.5">http://localhost:3030</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Environment Variables */}
          <section id="environment-variables" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Environment Variables</h2>
            </div>
            <p className="text-muted-foreground">
              Configure your backend API and frontend documentation site with the following environment variables.
            </p>

            {/* Backend Environment Variables */}
            <div id="backend-env" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-36">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-lg sm:text-xl font-semibold">Backend</h3>
              </div>
              <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm">
              <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                Create a <code className="rounded bg-muted px-1 py-0.5">.env</code> file in the root directory of your backend project.
              </p>
              
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">PORT</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Port number for the server to listen on. Defaults to <code className="rounded bg-muted px-1 py-0.5">3030</code> if not specified.
                  </p>
                  <CodeBlock code="PORT=3030" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">NODE_ENV</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Node environment. Defaults to <code className="rounded bg-muted px-1 py-0.5">development</code> if not specified.
                  </p>
                  <CodeBlock code="NODE_ENV=development" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">ORIGIN</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Comma-separated list of allowed CORS origins. Defaults to <code className="rounded bg-muted px-1 py-0.5">*</code> (all origins) if not specified.
                  </p>
                  <CodeBlock code="ORIGIN=https://example.com,https://app.example.com" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">RATE_LIMIT_WINDOW_MS</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Time window for rate limiting in milliseconds. Defaults to <code className="rounded bg-muted px-1 py-0.5">60000</code> (1 minute).
                  </p>
                  <CodeBlock code="RATE_LIMIT_WINDOW_MS=60000" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">RATE_LIMIT_LIMIT</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Maximum number of requests allowed per rate limit window. Defaults to <code className="rounded bg-muted px-1 py-0.5">100</code>.
                  </p>
                  <CodeBlock code="RATE_LIMIT_LIMIT=100" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">UPSTASH_REDIS_REST_URL</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Upstash Redis REST API URL for caching homepage data. If both Redis variables are set, the API will cache responses for 24 hours.
                  </p>
                  <CodeBlock code="UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">UPSTASH_REDIS_REST_TOKEN</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Upstash Redis REST API token. Required if using Redis caching.
                  </p>
                  <CodeBlock code="UPSTASH_REDIS_REST_TOKEN=your-redis-token" />
                </div>

              </div>

              <div className="mt-4 sm:mt-6 rounded-lg border bg-blue-50 p-3 sm:p-4">
                <h4 className="text-sm sm:text-base font-semibold mb-2">Example Backend .env File</h4>
                <CodeBlock
                  code={`PORT=3030
NODE_ENV=development
ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_LIMIT=100
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token`}
                />
              </div>
              </div>
            </div>

            {/* Frontend Environment Variables */}
            <div id="frontend-env" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-36">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-lg sm:text-xl font-semibold">Frontend</h3>
              </div>
              <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm">
              <p className="text-muted-foreground text-xs sm:text-sm mb-4">
                Create a <code className="rounded bg-muted px-1 py-0.5">.env.local</code> file in the <code className="rounded bg-muted px-1 py-0.5">docs-frontend</code> directory.
              </p>
              
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">NEXT_PUBLIC_API_URL</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Backend API URL used for API testing helpers in the documentation site.
                  </p>
                  <CodeBlock code="NEXT_PUBLIC_API_URL=https://your-api-domain.com" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">NEXT_PUBLIC_SITE_URL</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Public URL of your documentation site. Used for metadata and OG images. Defaults to <code className="rounded bg-muted px-1 py-0.5">http://localhost:3000</code> in development.
                  </p>
                  <CodeBlock code="NEXT_PUBLIC_SITE_URL=https://docs.yourdomain.com" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">TELEGRAM_BOT_TOKEN</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">Required for Support</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Telegram bot token from <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary underline">@BotFather</a>. Required for the maintainer support form to forward messages to Telegram.
                  </p>
                  <CodeBlock code="TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">TELEGRAM_CHAT_ID</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">Required for Support</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Telegram chat or channel ID where support form messages should be delivered. Required for the maintainer support form.
                  </p>
                  <CodeBlock code="TELEGRAM_CHAT_ID=123456789" />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <code className="text-xs sm:text-sm font-mono font-semibold text-primary">TIMEZONE</code>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">Optional</span>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                    Timezone for timestamps in Telegram support messages. Defaults to <code className="rounded bg-muted px-1 py-0.5">Asia/Dhaka</code>.
                  </p>
                  <CodeBlock code="TIMEZONE=Asia/Dhaka" />
                </div>
              </div>

              <div className="mt-4 sm:mt-6 rounded-lg border bg-blue-50 p-3 sm:p-4">
                <h4 className="text-sm sm:text-base font-semibold mb-2">Example Frontend .env.local File</h4>
                <CodeBlock
                  code={`# Backend API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://docs.yourdomain.com

# Telegram Support (Required for maintainer support form)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Timezone
TIMEZONE=Asia/Dhaka`}
                />
              </div>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border bg-amber-50 p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold mb-2">⚠️ Security Notes</h3>
              <ul className="list-disc space-y-2 pl-4 sm:pl-5 text-xs sm:text-sm text-muted-foreground">
                <li>
                  Never commit <code className="rounded bg-muted px-1 py-0.5">.env</code> or <code className="rounded bg-muted px-1 py-0.5">.env.local</code> files to version control.
                </li>
                <li>
                  In production, set environment variables through your hosting provider&apos;s dashboard (Vercel, Render, etc.).
                </li>
                <li>
                  Variables prefixed with <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_</code> are exposed to the browser and should not contain sensitive data.
                </li>
                <li>
                  All environment variables are optional - the API works without them with sensible defaults.
                </li>
              </ul>
            </div>
          </section>

          {/* Home Endpoint */}
          <section id="home" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-xl md:text-2xl font-semibold break-all">GET /api/v1/home</h2>
            </div>
            <p className="text-muted-foreground">
              Fetches the homepage content with TV channels organized by categories: trending, sports, news, documentary, kids, and islamic channels.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Request</h3>
                <CodeBlock
                  code={`const resp = await fetch('/api/v1/home');
const data = await resp.json();`}
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Response</h3>
                <CodeBlock
                  maxHeight="max-h-96"
                  code={`{
  "success": true,
  "data": {
    "trending": [
      {
        "title": "T Sports",
        "id": "t-sports",
        "poster": "https://example.com/poster.jpg",
        "category": "Sports"
      }
    ],
    "sports": [...],
    "news": [...],
    "documentary": [...],
    "kids": [...],
    "islamic": [...]
  }
}`}
                />
              </div>
            </div>
          </section>

          {/* Channel Details Endpoint */}
          <section id="channel-details" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-sm sm:text-lg md:text-2xl font-semibold break-all">GET /api/v1/channel/:id</h2>
            </div>
            <p className="text-muted-foreground">
              Retrieves detailed information about a specific TV channel including stream URL.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Request Example</h3>
                <CodeBlock
                  code={`const resp = await fetch('/api/v1/channel/t-sports');
const data = await resp.json();`}
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Response Example</h3>
                <CodeBlock
                  maxHeight="max-h-96"
                  code={`{
  "success": true,
  "data": {
    "title": "T Sports",
    "id": "t-sports",
    "poster": "https://example.com/poster.jpg",
    "category": "Sports",
    "description": "Channel description...",
    "streamUrl": "https://example.com/stream.m3u8"
  }
}`}
                />
              </div>
            </div>
          </section>

          {/* Channels by Category Endpoint */}
          <section id="channels-by-category" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-sm sm:text-lg md:text-2xl font-semibold break-all">GET /api/v1/channels/:query</h2>
            </div>
            <p className="text-muted-foreground">
              Fetches channels for a specific category with pagination support.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Path Parameters</h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <code className="rounded bg-muted px-2 py-1 min-w-fit">query</code>
                    <span className="text-muted-foreground">One of: trending, sports, news, documentary, kids, islamic</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Query Parameters</h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <code className="rounded bg-muted px-2 py-1 min-w-fit">page</code>
                    <span className="text-muted-foreground">Page number (optional, default: 1)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Request Example</h3>
                <CodeBlock
                  code={`const resp = await fetch('/api/v1/channels/sports?page=1');
const data = await resp.json();`}
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Response Example</h3>
                <CodeBlock
                  maxHeight="max-h-96"
                  code={`{
  "success": true,
  "data": {
    "pageInfo": {
      "totalPages": 1,
      "currentPage": 1,
      "hasNextPage": false
    },
    "response": [
      {
        "title": "T Sports",
        "id": "t-sports",
        "poster": "https://example.com/poster.jpg",
        "category": "Sports"
      }
    ]
  }
}`}
                />
              </div>
            </div>
          </section>

          {/* Categories Endpoint */}
          <section id="categories" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-sm sm:text-lg md:text-2xl font-semibold break-all">GET /api/v1/categories/:query</h2>
            </div>
            <p className="text-muted-foreground">
              Alternative endpoint for fetching channels by category. Same functionality as <code className="rounded bg-muted px-1 py-0.5">/channels/:query</code>.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Request Example</h3>
                <CodeBlock
                  code={`const resp = await fetch('/api/v1/categories/sports?page=1');
const data = await resp.json();`}
                />
              </div>
            </div>
          </section>

          {/* Search Endpoint */}
          <section id="search" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-xl md:text-2xl font-semibold break-all">GET /api/v1/search</h2>
            </div>
            <p className="text-muted-foreground">
              Searches for TV channels by keyword with pagination support.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Query Parameters</h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <code className="rounded bg-muted px-2 py-1 min-w-fit">keyword</code>
                    <span className="text-muted-foreground">Search query (required)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <code className="rounded bg-muted px-2 py-1 min-w-fit">page</code>
                    <span className="text-muted-foreground">Page number (optional, default: 1)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Request Example</h3>
                <CodeBlock
                  code={`const resp = await fetch('/api/v1/search?keyword=bbc&page=1');
const data = await resp.json();`}
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Response Example</h3>
                <CodeBlock
                  maxHeight="max-h-96"
                  code={`{
  "success": true,
  "data": {
    "pageInfo": {
      "totalPages": 1,
      "currentPage": 1,
      "hasNextPage": false
    },
    "response": [
      {
        "title": "BBC News",
        "id": "bbc-news",
        "poster": "https://example.com/poster.jpg",
        "category": "News"
      }
    ]
  }
}`}
                />
              </div>
            </div>
          </section>

          {/* Servers Endpoint */}
          <section id="servers" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Server className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-xl md:text-2xl font-semibold break-all">GET /api/v1/servers</h2>
            </div>
            <p className="text-muted-foreground">
              Fetches available streaming servers for a channel.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Query Parameters</h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <code className="rounded bg-muted px-2 py-1 min-w-fit">id</code>
                    <span className="text-muted-foreground">Channel ID (e.g., t-sports) - required</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Request Example</h3>
                <CodeBlock
                  code={`const resp = await fetch('/api/v1/servers?id=t-sports');
const data = await resp.json();`}
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Response Example</h3>
                <CodeBlock
                  maxHeight="max-h-96"
                  code={`{
  "success": true,
  "data": {
    "servers": [
      {
        "index": 1,
        "type": "live",
        "id": "stream-1",
        "name": "Live Stream",
        "quality": "auto",
        "url": "https://example.com/stream.m3u8"
      }
    ],
    "streamUrl": "https://example.com/stream.m3u8"
  }
}`}
                />
              </div>
            </div>
          </section>

          {/* Stream Endpoint */}
          <section id="streaming" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-xl md:text-2xl font-semibold break-all">GET /api/v1/stream</h2>
            </div>
            <p className="text-muted-foreground">
              Gets the streaming URL for a TV channel. Returns the live stream URL with player link.
            </p>
            <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Query Parameters</h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <code className="rounded bg-muted px-2 py-1 min-w-fit">id</code>
                    <span className="text-muted-foreground">Channel ID (e.g., t-sports) - required</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Request Example</h3>
                <CodeBlock
                  code={`const resp = await fetch('/api/v1/stream?id=t-sports');
const data = await resp.json();`}
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Response Example</h3>
                <CodeBlock
                  maxHeight="max-h-96"
                  code={`{
  "success": true,
  "data": {
    "link": {
      "file": "https://example.com/stream.m3u8"
    },
    "streamingLink": "https://example.com/stream.m3u8",
    "player": "/player?url=https%3A%2F%2Fexample.com%2Fstream.m3u8",
    "quality": {
      "selectedServer": "Live Stream",
      "selectedQuality": "auto",
      "format": "HLS",
      "adaptive": true
    },
    "channel": {
      "id": "t-sports",
      "title": "T Sports",
      "poster": "https://example.com/poster.jpg"
    }
  }
}`}
                />
              </div>
            </div>
          </section>

          {/* Deployment */}
          <section id="deployment" className="space-y-3 sm:space-y-4 scroll-mt-24 sm:scroll-mt-36">
            <div className="flex items-center gap-2 sm:gap-3">
              <Server className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold">Deployment</h2>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">Deploy to Vercel or Render</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                  This API works on both platforms. See the README.md in the backend directory for detailed deployment instructions.
                </p>
                <ul className="list-disc space-y-2 pl-4 sm:pl-5 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  <li><strong>Vercel:</strong> Automatically uses fetch-based scraping (Puppeteer disabled)</li>
                  <li><strong>Render:</strong> Full Puppeteer support for complete functionality</li>
                </ul>
              </div>

              <div className="rounded-xl sm:rounded-2xl border bg-emerald-50 p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  Try the API Testing Playground
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                  Run requests from your browser with our custom testing interface—no setup or external tools required.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/testing"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                  >
                    Open Testing UI
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Need Help?</p>
                <p className="text-muted-foreground text-sm">
                  Contact us for support and more information.
                </p>
              </div>
              <Link
                href="/maintainer#contact"
                className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-semibold hover:bg-muted/80"
              >
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </footer>
        </article>

        {/* Right Sidebar - On This Page */}
        <aside className="sticky top-24 z-10 hidden w-64 shrink-0 self-start xl:block">
          <div className="max-h-[calc(100vh-96px)] space-y-4 overflow-y-auto rounded-2xl border bg-background/70 p-6 shadow-xl shadow-black/5 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">On this page</p>
            <OnThisPageNav links={navLinks} />
          </div>
        </aside>
      </section>
    </div>
  );
}

