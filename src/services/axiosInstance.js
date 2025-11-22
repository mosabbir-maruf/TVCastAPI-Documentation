import config from '../config/config.js';

// Lazy-load Puppeteer (only when needed and available)
let puppeteer = null;
let puppeteerAvailable = false;
let puppeteerLoadAttempted = false;

const loadPuppeteer = async () => {
  if (puppeteerLoadAttempted) {
    return puppeteerAvailable;
  }
  puppeteerLoadAttempted = true;
  
  try {
    const puppeteerModule = await import('puppeteer');
    puppeteer = puppeteerModule.default;
    puppeteerAvailable = true;
    return true;
  } catch (error) {
    console.warn('Puppeteer not available, will use fetch fallback:', error.message);
    puppeteerAvailable = false;
    return false;
  }
};

let browser = null;

// Simple in-memory cache (fallback when Redis is not available)
const memoryCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 50;

// Periodic cache cleanup to prevent memory leaks
let cacheCleanupInterval = setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      memoryCache.delete(key);
      cleaned++;
    }
  }
  // Also enforce max size (LRU eviction)
  if (memoryCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(memoryCache.entries());
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => memoryCache.delete(key));
  }
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

// Export cleanup function to clear interval on shutdown
export const clearCacheCleanup = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
    cacheCleanupInterval = null;
  }
};

// Initialize browser instance (singleton)
const getBrowser = async () => {
  const canUsePuppeteer = await loadPuppeteer();
  if (!canUsePuppeteer || !puppeteer) {
    throw new Error('Puppeteer is not available on this platform');
  }
  
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-images', // Don't load images for faster rendering (we only need HTML structure)
        ],
      });
      
      // Handle browser disconnection (crashes, etc.)
      browser.on('disconnected', () => {
        browser = null; // Reset so it can be recreated
      });
    } catch (error) {
      console.error('Failed to launch browser:', error);
      browser = null;
      throw error;
    }
  }
  return browser;
};

export const axiosInstance = async (endpoint, options = {}) => {
  try {
    const { needStreamInfo = false } = options;
    
    // Check cache first (in-memory fallback)
    const cacheKey = endpoint;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      const cacheTTL = cached.ttl || CACHE_TTL; // Use custom TTL if set, otherwise default
      if (cacheAge < cacheTTL) {
        return cached.data;
      } else {
        // Remove expired cache entry
        memoryCache.delete(cacheKey);
      }
    }
    
    // Check if we need to use Puppeteer (for React SPA sites like tv.movienestbd.site)
    const canUsePuppeteer = await loadPuppeteer();
    const usePuppeteer = config.baseurl.includes('movienestbd.site') && canUsePuppeteer;
    
    if (usePuppeteer) {
      let page = null;
      let requestHandler = null;
      try {
        const browserInstance = await getBrowser();
        page = await browserInstance.newPage();
        
        // Set user agent
        await page.setUserAgent(config.headers['User-Agent']);
        
        // Disable images and other resources for faster loading (we only need HTML structure)
        await page.setRequestInterception(true);
        
        // Create request handler function
        requestHandler = (req) => {
          const resourceType = req.resourceType();
          // Block images, fonts, and media for faster loading
          // But allow iframes (needed for stream detection) and scripts/styles (needed for React)
          if (['image', 'font', 'media'].includes(resourceType)) {
            req.abort();
          } else {
            req.continue();
          }
        };
        
        page.on('request', requestHandler);
      
      // Navigate to the page
      const url = config.baseurl + endpoint;
      
      // Performance optimization: Use networkidle2 instead of networkidle0 for faster loading
      // networkidle2 waits for max 2 connections (much faster than networkidle0 which waits for 0)
      // This reduces load time from 15-30s to 5-10s for detail pages
      const waitStrategy = 'networkidle2';
      const navigationTimeout = needStreamInfo ? 20000 : 15000; // Shorter timeout for detail pages
      
      await page.goto(url, {
        waitUntil: waitStrategy,
        timeout: navigationTimeout,
      });
      
      // Wait for React to render and content to load
      // For homepage, wait for channel links or sections to appear
      if (endpoint === '/' || endpoint === '') {
        try {
          // Wait for channel links or category sections to appear
          await page.waitForSelector('a[href*="/live/"], .mb-10, .mb-12', { 
            timeout: 8000 // Reduced from 10000
          }).catch(() => {
            // If selectors don't match, continue anyway
          });
        } catch (e) {
          // Continue even if selectors aren't found
        }
      }
      
      // Reduced wait for React to hydrate - 1 second is usually enough
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Only wait for JWPlayer if we need stream info (detail pages)
      let streamInfo = null;
      if (needStreamInfo) {
        try {
          // Try to wait for iframe, but don't wait too long (1 second max)
          await page.waitForSelector('iframe', { timeout: 1000 }).catch(() => {});
          
          // Try to get stream info with smart retry (don't wait too long)
          let attempts = 0;
          const maxAttempts = 3;
          const retryDelay = 500; // 500ms between retries
          
          while (attempts < maxAttempts && !streamInfo?.streamUrl) {
            streamInfo = await page.evaluate(() => {
              // Check if JWPlayer is available
              if (window.jwplayer) {
                try {
                  const player = window.jwplayer();
                  if (player) {
                    const playlist = player.getPlaylist();
                    if (playlist && playlist.length > 0) {
                      const file = playlist[0].file || (playlist[0].sources && playlist[0].sources[0] ? playlist[0].sources[0].file : null);
                      if (file) {
                        return {
                          streamUrl: file,
                          poster: playlist[0].image || null,
                        };
                      }
                    }
                  }
                } catch (e) {
                  // JWPlayer might not be ready yet
                }
              }
              
              // Fallback: check iframe
              const iframe = document.querySelector('iframe');
              if (iframe && iframe.src) {
                return {
                  streamUrl: iframe.src,
                  poster: null,
                };
              }
              
              return null;
            });
            
            // If we got stream info, break out of loop
            if (streamInfo?.streamUrl) {
              break;
            }
            
            // Wait a bit before retrying (only if not last attempt)
            if (attempts < maxAttempts - 1) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            attempts++;
          }
          
          // If still no stream info, set to null (extractor will try to find it from HTML)
          if (!streamInfo?.streamUrl) {
            streamInfo = null;
          }
        } catch (e) {
          // Continue if evaluation fails - extractor will try to find stream from HTML
          streamInfo = null;
        }
      }
      
      // Get the rendered HTML
      const data = await page.content();
      
      // Remove event listener before closing (if handler was set)
      if (requestHandler) {
        page.off('request', requestHandler);
      }
      
      // Close the page (but keep browser open for reuse)
      await page.close().catch(() => {
        // Ignore errors when closing page
      });
      page = null;
      
      const result = {
        success: true,
        data,
        streamInfo: streamInfo,
      };
      
      // Cache the result
      // For detail pages with stream info, cache with shorter TTL (5 minutes) since stream URLs might change
      // For homepage, cache with longer TTL (1 hour)
      if (needStreamInfo) {
        // Cache detail pages with shorter TTL (5 minutes) - stream URLs might change but basic info is stable
        const detailCacheTTL = 5 * 60 * 1000; // 5 minutes
        memoryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: detailCacheTTL, // Custom TTL for detail pages
        });
      } else {
        // Cache homepage with default TTL (1 hour)
        memoryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }
      
      // Limit cache size to prevent memory issues (LRU eviction)
      if (memoryCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(memoryCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
        toRemove.forEach(([key]) => memoryCache.delete(key));
      }
      
      return result;
      } catch (pageError) {
        // Cleanup page on error
        if (page) {
          try {
            await page.close();
          } catch (closeError) {
            // Ignore close errors
          }
        }
        throw pageError; // Re-throw to be caught by outer try-catch
      }
    } else {
      // Use regular fetch (for server-rendered sites or when Puppeteer is unavailable)
      // Enhanced fetch with retries for better reliability
      const maxRetries = 1;
      const retryDelay = 1000; // 1 second between retries
      let lastError = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
        
        const controller = new AbortController();
        const timeout = 15000; // 15 second timeout
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const response = await fetch(config.baseurl + endpoint, {
            headers: {
              ...(config.headers || {}),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.text();
          
          // Cache the result
          memoryCache.set(cacheKey, {
            data: {
              success: true,
              data,
            },
            timestamp: Date.now(),
          });
          
          return {
            success: true,
            data,
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);
          lastError = fetchError;
          
          // Don't retry on certain errors
          if (fetchError.name === 'AbortError' && attempt < maxRetries) {
            continue; // Retry timeout errors
          }
          if (fetchError.message?.includes('HTTP 4')) {
            throw fetchError; // Don't retry 4xx errors
          }
          if (attempt === maxRetries) {
            break; // Last attempt failed
          }
        }
      }
      
      // All retries failed
      if (lastError?.name === 'AbortError') {
        throw new Error('Request timeout after retries');
      }
      throw lastError || new Error('Request failed');
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Cleanup function to close browser
export const closeBrowser = async () => {
  const canUsePuppeteer = await loadPuppeteer();
  if (browser && canUsePuppeteer) {
    try {
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
    browser = null;
  }
};
