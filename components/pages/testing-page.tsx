'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Home,
  Film,
  Search,
  PlayCircle,
  Server,
  Copy,
  Check,
  Shield,
  ChevronDown,
  ChevronRight,
  X,
  Code2,
} from 'lucide-react';
import { Pattern } from '@/components/ui/pattern';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import { OnThisPageNav } from '@/components/privacy/on-this-page-nav';
import { siteConfig } from '@/config/site';
import Script from 'next/script';
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import { MobileHeader } from '@/components/ui/mobile-header';
import { SupportButton } from '@/components/ui/support-button';

interface EndpointConfig {
  method: 'GET';
  path: string;
  description: string;
  category: string;
  icon: React.ElementType;
  params?: {
    name: string;
    type: 'path' | 'query';
    required: boolean;
    placeholder?: string;
    defaultValue?: string;
  }[];
}

const endpoints: EndpointConfig[] = [
  {
    method: 'GET',
    path: '/api/v1/home',
    description: 'Fetch homepage content with TV channels by categories',
    category: 'Core',
    icon: Home,
  },
  {
    method: 'GET',
    path: '/api/v1/channel/{id}',
    description: 'Get channel details by ID',
    category: 'Core',
    icon: Film,
    params: [
      { name: 'id', type: 'path', required: true, placeholder: 't-sports', defaultValue: 't-sports' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/channels/{query}',
    description: 'Get channels by category',
    category: 'Core',
    icon: Film,
    params: [
      { name: 'query', type: 'path', required: true, placeholder: 'sports', defaultValue: 'sports' },
      { name: 'page', type: 'query', required: false, placeholder: '1', defaultValue: '1' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/categories/{query}',
    description: 'Alternative endpoint for channels by category',
    category: 'Core',
    icon: Film,
    params: [
      { name: 'query', type: 'path', required: true, placeholder: 'sports', defaultValue: 'sports' },
      { name: 'page', type: 'query', required: false, placeholder: '1', defaultValue: '1' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/search',
    description: 'Search TV channels by keyword',
    category: 'Search',
    icon: Search,
    params: [
      { name: 'keyword', type: 'query', required: true, placeholder: 'bbc', defaultValue: 'bbc' },
      { name: 'page', type: 'query', required: false, placeholder: '1', defaultValue: '1' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/servers',
    description: 'Get available streaming servers for a channel',
    category: 'Streaming',
    icon: Server,
    params: [
      { name: 'id', type: 'query', required: true, placeholder: 't-sports', defaultValue: 't-sports' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/stream',
    description: 'Get stream URL for a TV channel',
    category: 'Streaming',
    icon: PlayCircle,
    params: [
      { name: 'id', type: 'query', required: true, placeholder: 't-sports', defaultValue: 't-sports' },
    ],
  },
];

const categories = Array.from(new Set(endpoints.map((e) => e.category)));

// Navigation links
const leftNavGroups = [
  {
    heading: null,
    links: [
      { label: 'Documentation', href: '/' },
      { label: 'API Testing', href: '/testing', current: true },
      { label: 'Maintainer', href: '/maintainer' },
      { label: 'GitHub Repository', href: siteConfig.github, external: true },
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      { label: 'Installation', href: '/#installation' },
      { label: 'Environment Variables', href: '/#environment-variables' },
      { label: 'Backend', href: '/#backend-env', subItem: true },
      { label: 'Frontend', href: '/#frontend-env', subItem: true },
      { label: 'API Endpoints', href: '/#home' },
    ],
  },
];

const navLinks = [
  { id: 'configuration', label: 'Configuration' },
  ...categories.map((cat) => ({ id: cat.toLowerCase().replace(/\s+/g, '-'), label: cat })),
];

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function TestingPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [envVarsExpanded, setEnvVarsExpanded] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });

  useEffect(() => {
    // Check if HLS.js is already loaded
    if (typeof window !== 'undefined' && 'Hls' in window) {
      setHlsLoaded(true);
    }
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const buildUrl = (endpoint: EndpointConfig, paramValues: { [key: string]: string }) => {
    // Ensure baseUrl is set
    if (!baseUrl || baseUrl.trim() === '') {
      throw new Error('Base URL is not configured. Please set it in the Configuration section above.');
    }

    // Normalize baseUrl: remove trailing slash if present
    let normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
    
    // If user included /api/v1 in baseUrl, remove it since endpoints already include it
    if (normalizedBaseUrl.endsWith('/api/v1')) {
      normalizedBaseUrl = normalizedBaseUrl.replace(/\/api\/v1$/, '');
    }
    
    // Ensure endpoint path starts with /
    const normalizedPath = endpoint.path.startsWith('/') ? endpoint.path : `/${endpoint.path}`;
    
    let url = normalizedBaseUrl + normalizedPath;

    // Replace path parameters
    endpoint.params
      ?.filter((p) => p.type === 'path')
      .forEach((param) => {
        url = url.replace(`{${param.name}}`, paramValues[param.name] || param.defaultValue || '');
      });

    // Add query parameters
    const queryParams = endpoint.params
      ?.filter((p) => p.type === 'query' && paramValues[p.name])
      .map((param) => `${param.name}=${encodeURIComponent(paramValues[param.name])}`)
      .join('&');

    if (queryParams) {
      url += `?${queryParams}`;
    }

    return url;
  };

  const executeRequest = async (endpoint: EndpointConfig, paramValues: { [key: string]: string }) => {
    const key = endpoint.path;
    
    // Validate baseUrl before proceeding
    if (!baseUrl || baseUrl.trim() === '') {
      setResponses((prev) => ({
        ...prev,
        [key]: {
          status: 'Error',
          statusText: 'Base URL is required',
          time: 0,
          data: 'Please configure the Base URL in the Configuration section above before making requests.',
          url: '',
        },
      }));
      return;
    }
    
    // Special handling for proxy stream - show inline video player
    if (endpoint.path === '/proxy/stream') {
      try {
        const url = buildUrl(endpoint, paramValues);
        setPlayerUrl(url);
        
        setResponses((prev) => ({
          ...prev,
          [key]: {
            status: 'Player',
            statusText: 'Video player loaded',
            time: 0,
            data: 'Video player',
            url,
          },
        }));
      } catch (error: any) {
        setResponses((prev) => ({
          ...prev,
          [key]: {
            status: 'Error',
            statusText: error.message,
            time: 0,
            data: null,
            url: '',
          },
        }));
      }
      return;
    }
    
    setLoading((prev) => ({ ...prev, [key]: true }));
    setResponses((prev) => ({ ...prev, [key]: null }));

    let url = '';
    try {
      url = buildUrl(endpoint, paramValues);
      const headers: HeadersInit = {};

      const startTime = performance.now();
      // Use a longer timeout for actual API requests (scraping can take time)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, { 
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Special handling for /api/v1/stream - extract stream URL for video player
      // But still show the JSON response
      if (endpoint.path === '/api/v1/stream' && response.ok && typeof data === 'object') {
        // Extract stream URL from response
        // The API returns: { success: true, data: { streamingLink: "...", link: { file: "..." } } }
        const streamUrl = data?.data?.streamingLink || data?.data?.link?.file || data?.streamingLink || data?.link?.file;
        
        if (streamUrl && typeof streamUrl === 'string') {
          setPlayerUrl(streamUrl);
        }
      }

      setResponses((prev) => ({
        ...prev,
        [key]: {
          status: response.status,
          statusText: response.statusText,
          time: Math.round(endTime - startTime),
          data,
          url,
        },
      }));
    } catch (error: any) {
      let errorMessage = 'Network error: Could not connect to the API.';
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = `Connection failed. Please check:
1. Your backend server is running at ${baseUrl}
2. CORS is properly configured on your backend
3. The URL is correct (use base URL only, e.g., http://localhost:3030)`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setResponses((prev) => ({
        ...prev,
        [key]: {
          status: 'Error',
          statusText: 'Failed to fetch',
          time: 0,
          data: errorMessage,
          url: url || baseUrl + endpoint.path,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const testConnection = async () => {
    if (!baseUrl || baseUrl.trim() === '') {
      setConnectionStatus({
        status: 'error',
        message: 'Please enter a base URL first',
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus({ status: null, message: '' });

    try {
      let testUrl = baseUrl.trim().replace(/\/+$/, '');
      if (testUrl.endsWith('/api/v1')) {
        testUrl = testUrl.replace(/\/api\/v1$/, '');
      }
      
      // Try multiple endpoints to test connection
      const testEndpoints = [
        testUrl + '/api/v1',  // API documentation endpoint
        testUrl + '/ping',     // Health check endpoint
        testUrl + '/api/v1/home', // Actual API endpoint
      ];

      let lastError: Error | null = null;
      let success = false;

      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            // Add a longer timeout for scraping endpoints
            signal: AbortSignal.timeout(15000), // 15 second timeout for scraping
          });

          if (response.ok || response.status === 200 || response.status === 404) {
            // 404 is okay - it means server is responding
            success = true;
            setConnectionStatus({
              status: 'success',
              message: `Connection successful! Backend is accessible at ${testUrl}. Status: ${response.status}`,
            });
            break;
          } else {
            // Server responded but with error status
            success = true;
            setConnectionStatus({
              status: 'success',
              message: `Backend is accessible (responded with status ${response.status}). Connection works!`,
            });
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Continue to next endpoint
          continue;
        }
      }

      if (!success && lastError) {
        throw lastError;
      }
    } catch (error: any) {
      let errorMsg = 'Connection failed. ';
      
      if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        errorMsg += `Request timed out after 15 seconds. The server at ${baseUrl} may be slow (scraping data) or not responding. `;
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMsg += `Cannot reach ${baseUrl}. `;
      } else {
        errorMsg += `${error.message || 'Unknown error'}. `;
      }

      errorMsg += `Please check:
1. Backend server is running: Open terminal in "TVCastAPI Backend" directory and run "npm run dev"
2. Backend is on correct port: Check terminal for "Server started on http://localhost:3030"
3. CORS is configured: In backend .env file, add "ORIGIN=*" (or your frontend URL)
4. Try in browser: Open ${baseUrl}/api/v1 in a new tab to verify backend is accessible`;

      setConnectionStatus({
        status: 'error',
        message: errorMsg,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <>
      {/* Load HLS.js */}
      <Script
        src="https://cdn.jsdelivr.net/npm/hls.js@latest"
        onLoad={() => setHlsLoaded(true)}
        strategy="afterInteractive"
      />
      
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
                <p className="text-muted-foreground text-xs">API Testing</p>
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
                          className={`rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                            'current' in link && link.current ? 'text-primary font-semibold' : ''
                          }`}
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

      <div className="relative isolate bg-background">
        <Pattern variant="dots" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70">
          <div className="absolute left-1/2 top-[-10%] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-80 w-80 translate-x-1/3 rounded-full bg-[#8b5cf6]/20 blur-[150px]" />
          <div className="absolute bottom-[-15%] left-0 h-64 w-64 -translate-x-1/3 rounded-full bg-emerald-400/15 blur-[120px]" />
        </div>

        <section className="mx-auto flex w-full max-w-[1600px] items-start gap-4 px-4 py-8 sm:py-12 md:py-16 lg:px-0">
          {/* Left Sidebar */}
          <aside className="sticky top-24 hidden w-64 shrink-0 self-start lg:block">
            <div className="max-h-[calc(100vh-96px)] space-y-6 overflow-y-auto rounded-2xl border bg-background/70 p-6 shadow-xl shadow-black/5 backdrop-blur">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{siteConfig.name}</p>
                  <p className="text-muted-foreground text-xs">API Testing</p>
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
                            className={`rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                              'current' in link && link.current ? 'text-primary font-semibold' : ''
                            }`}
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
          <article className="flex-1 space-y-8 sm:space-y-10 md:space-y-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">

          <header className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border bg-background/70 p-4 sm:p-6 md:p-8 shadow-lg shadow-black/5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Interactive API Testing
            </p>
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">API Testing Interface</h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                A sleek, theme-aligned console for exercising every TVCastAPI endpoint in real time. 
                Send requests, inspect beautifully formatted responses, and test streaming URLs—all 
                without leaving your browser.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:flex sm:flex-wrap sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wide">Version</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm">v1.0</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wide">Base URL</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm">/api/v1</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wide">Format</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm">JSON</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wide">API Endpoints</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm">7</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-wide">Development Maintained</p>
                <p className="font-semibold text-foreground text-xs sm:text-sm">Yes</p>
              </div>
            </div>
          </header>
        </div>


        {/* API Configuration */}
        <section id="configuration" className="mb-6 sm:mb-8 space-y-4 sm:space-y-6 rounded-xl sm:rounded-2xl border bg-background/70 p-4 sm:p-6 shadow-lg shadow-black/5 backdrop-blur scroll-mt-24 sm:scroll-mt-36">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Configuration</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
              Set up your server endpoint before testing. TVCastAPI is open and does not require an API key.
            </p>
          </div>
          
          <div className="grid gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                <Server className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                Base URL
                {!baseUrl && (
                  <span className="text-[10px] text-red-500 ml-1">(Required)</span>
                )}
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={DEFAULT_BASE_URL || "http://localhost:3030"}
                className="w-full rounded-lg border bg-background px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {!baseUrl ? (
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Set via <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_API_URL</code> env variable or enter manually
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Enter the base URL without the endpoint path (e.g., <code className="rounded bg-muted px-1 py-0.5">http://localhost:3030</code>)
                  </p>
                  <button
                    onClick={testConnection}
                    disabled={testingConnection}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition disabled:opacity-50"
                  >
                    {testingConnection ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <Server className="h-3 w-3" />
                        Test Connection
                      </>
                    )}
                  </button>
                  {connectionStatus.status && (
                    <div
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        connectionStatus.status === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-red-200 bg-red-50 text-red-900'
                      }`}
                    >
                      {connectionStatus.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg sm:rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
            <h3 className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
              Quick Start
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[10px] sm:text-xs text-muted-foreground">
              <li>Enter your base URL above (e.g., <code className="rounded bg-muted px-1 py-0.5">http://localhost:3030</code>)</li>
              <li>Click &quot;Test Connection&quot; to verify your backend is accessible</li>
              <li>Expand any category below to see available endpoints</li>
              <li>Fill in the required parameters and click &quot;Try it out&quot;</li>
              <li>View the response in the formatted output below each endpoint</li>
            </ul>
          </div>

          {connectionStatus.status === 'error' && (
            <div className="rounded-lg sm:rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
              <h3 className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2 text-red-900">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                Troubleshooting
              </h3>
              <div className="space-y-2 text-[10px] sm:text-xs text-red-800">
                <p className="font-semibold">If connection fails, check:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Backend server is running: Open terminal in backend directory and run <code className="rounded bg-red-100 px-1 py-0.5">npm run dev</code></li>
                  <li>Backend is on correct port: Check terminal output for &quot;Server started on http://localhost:3030&quot;</li>
                  <li>CORS configuration: In backend <code className="rounded bg-red-100 px-1 py-0.5">.env</code> file, ensure <code className="rounded bg-red-100 px-1 py-0.5">ORIGIN=*</code> (or add your frontend URL)</li>
                  <li>Try accessing directly: Open <code className="rounded bg-red-100 px-1 py-0.5">{baseUrl}/api/v1</code> in your browser</li>
                </ol>
              </div>
            </div>
          )}
        </section>

        {/* Endpoints by Category */}
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryEndpoints = endpoints.filter((e) => e.category === category);
            const isExpanded = expandedCategories.includes(category);
            const categoryId = category.toLowerCase().replace(/\s+/g, '-');

            return (
              <section key={category} id={categoryId} className="rounded-xl sm:rounded-2xl border bg-background/70 shadow-lg backdrop-blur scroll-mt-24 sm:scroll-mt-36">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-muted/50 transition-colors rounded-xl sm:rounded-2xl"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    )}
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold">{category}</h2>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ({categoryEndpoints.length} endpoint{categoryEndpoints.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
                    {categoryEndpoints.map((endpoint) => (
                      <EndpointCard
                        key={endpoint.path}
                        endpoint={endpoint}
                        onExecute={executeRequest}
                        loading={loading[endpoint.path]}
                        response={responses[endpoint.path]}
                        onCopyUrl={copyToClipboard}
                        copiedUrl={copiedUrl}
                        playerUrl={playerUrl}
                        hlsLoaded={hlsLoaded}
                        onClosePlayer={(path) => {
                          setPlayerUrl(null);
                          setResponses((prev) => ({ ...prev, [path]: null }));
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border bg-background/80 p-4 sm:p-6 shadow-sm">
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
        <aside className="sticky top-24 hidden w-64 shrink-0 self-start xl:block">
          <div className="max-h-[calc(100vh-96px)] space-y-4 overflow-y-auto rounded-2xl border bg-background/70 p-6 shadow-xl shadow-black/5 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">On this page</p>
            <OnThisPageNav links={navLinks} />
          </div>
        </aside>
      </section>
    </div>
    </div>
    </>
  );
}

interface EndpointCardProps {
  endpoint: EndpointConfig;
  onExecute: (endpoint: EndpointConfig, params: { [key: string]: string }) => void;
  loading?: boolean;
  response?: any;
  onCopyUrl: (url: string, id: string) => void;
  copiedUrl: string | null;
  playerUrl: string | null;
  hlsLoaded: boolean;
  onClosePlayer: (endpointPath: string) => void;
}

function EndpointCard({ endpoint, onExecute, loading, response, onCopyUrl, copiedUrl, playerUrl, hlsLoaded, onClosePlayer }: EndpointCardProps) {
  const [paramValues, setParamValues] = useState<{ [key: string]: string }>(
    endpoint.params?.reduce(
      (acc, param) => ({
        ...acc,
        [param.name]: param.defaultValue || '',
      }),
      {}
    ) || {}
  );

  const Icon = endpoint.icon;
  const hasParams = endpoint.params && endpoint.params.length > 0;

  const handleExecute = () => {
    onExecute(endpoint, paramValues);
  };

  return (
    <div className="rounded-lg sm:rounded-xl border bg-background/80 overflow-hidden">
      {/* Endpoint Header */}
      <div className="p-3 sm:p-4 border-b bg-muted/30">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                  {endpoint.method}
                </span>
                <code className="text-xs sm:text-sm font-mono break-all">{endpoint.path}</code>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{endpoint.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parameters */}
      {hasParams && (
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-b">
          <h4 className="text-xs sm:text-sm font-semibold">Parameters</h4>
          <div className="grid gap-2 sm:gap-3">
            {endpoint.params?.map((param) => (
              <div key={param.name} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                <div className="md:col-span-1">
                  <label className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                    {param.name}
                    {param.required && <span className="text-red-500 text-[10px] sm:text-xs">*</span>}
                  </label>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {param.type === 'path' ? 'path' : 'query'}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={paramValues[param.name] || ''}
                    onChange={(e) =>
                      setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))
                    }
                    placeholder={param.placeholder}
                    className="w-full rounded-lg border bg-background px-3 py-2.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="p-3 sm:p-4 bg-muted/20">
        <Button onClick={handleExecute} disabled={loading} className="w-full text-xs sm:text-sm md:w-auto">
          {loading ? (
            <>
              <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              <span className="text-xs sm:text-sm">Loading...</span>
            </>
          ) : (
            <>
              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="text-xs sm:text-sm">Try it out</span>
            </>
          )}
        </Button>
      </div>

      {/* Response */}
      {response && (
        <div className="p-3 sm:p-4 border-t">
          <div className="space-y-2 sm:space-y-3">
            {/* Response Info */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-semibold">Response</h4>
              <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                <span
                  className={`px-2 py-1 rounded font-semibold ${
                    response.status === 'Player' || (response.status >= 200 && response.status < 300)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
                {response.time > 0 && (
                  <span className="text-muted-foreground">{response.time}ms</span>
                )}
              </div>
            </div>

            {/* Request URL */}
            {response.url && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 sm:p-3">
                <code className="text-[10px] sm:text-xs flex-1 break-all">{response.url}</code>
                <button
                  onClick={() => onCopyUrl(response.url, endpoint.path)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {copiedUrl === endpoint.path ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </button>
              </div>
            )}

            {/* Video Player Response */}
            {response.status === 'Player' ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-emerald-900">
                        Video Player Ready
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-emerald-700">
                        Stream loaded successfully. Use controls below to play.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onClosePlayer(endpoint.path)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {playerUrl && hlsLoaded && <VideoPlayer url={playerUrl} />}
                {playerUrl && !hlsLoaded && (
                  <div className="rounded-lg border bg-muted/30 p-3 sm:p-4 text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Loading video player...</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Response Body - Show JSON first */}
                <div className="rounded-lg border bg-muted/30 p-3 sm:p-4 max-h-64 sm:max-h-96 overflow-auto">
                  <pre className="text-[10px] sm:text-xs font-mono whitespace-pre-wrap break-words break-all w-full">
                    {typeof response.data === 'object'
                      ? JSON.stringify(response.data, null, 2)
                      : response.data}
                  </pre>
                </div>
                {/* Show video player for /api/v1/stream if playerUrl is available - Show after JSON */}
                {endpoint.path === '/api/v1/stream' && playerUrl && (
                  <div className="space-y-2 sm:space-y-3 mt-4">
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs font-semibold text-emerald-900">
                            Video Player Ready
                          </p>
                          <p className="text-[9px] sm:text-[10px] text-emerald-700">
                            Stream loaded successfully. Use controls below to play.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => onClosePlayer(endpoint.path)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {hlsLoaded && <VideoPlayer url={playerUrl} />}
                    {!hlsLoaded && (
                      <div className="rounded-lg border bg-muted/30 p-3 sm:p-4 text-center">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Loading video player...</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

