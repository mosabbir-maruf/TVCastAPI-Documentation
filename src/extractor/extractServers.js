import { load } from 'cheerio';

export const extractServers = (html, streamInfo = null) => {
  const $ = load(html);

  // For TV channels, extract stream URL - prefer from JWPlayer streamInfo, otherwise try to extract from HTML
  let streamUrl = null;

  // First, try to get stream URL from JWPlayer streamInfo (most reliable)
  if (streamInfo && streamInfo.streamUrl) {
    streamUrl = streamInfo.streamUrl;
  } else {
    // Fallback: Look for iframe (even if src is empty, it might be set dynamically)
    const iframe = $('iframe').first();
    if (iframe.length) {
      streamUrl = iframe.attr('src') || iframe.attr('data-src') || iframe.attr('data-actual-src') || null;
      
      // If iframe src is not set, check if there's a data attribute or look in scripts
      // Optimize: only check script tags that might contain JWPlayer config
      if (!streamUrl) {
        const scripts = $('script').slice(0, 10); // Limit to first 10 scripts
        for (let i = 0; i < scripts.length; i++) {
          const scriptContent = $(scripts[i]).html() || '';
          if (scriptContent.includes('jwplayer') || scriptContent.includes('file') || scriptContent.includes('sources')) {
            // Try to extract URL from script
            const urlMatch = scriptContent.match(/https?:\/\/[^\s"']+\.(m3u8|mp4|flv|ts)/i);
            if (urlMatch) {
              streamUrl = urlMatch[0];
              break;
            }
            
            // Look for JWPlayer setup with file property
            const fileMatch = scriptContent.match(/file\s*[:=]\s*["']([^"']+)["']/i);
            if (fileMatch) {
              streamUrl = fileMatch[1];
              break;
            }
          }
        }
      }
    }
  }

  // For TV channels, return a simplified server structure
  // Since TV channels typically have one stream, we'll return it as a single server option
  const defaultServer = streamUrl ? {
    index: 1,
    type: 'live',
    id: 'stream-1',
    name: 'Live Stream',
    quality: 'auto',
    bitrateKbps: null,
    url: streamUrl,
  } : null;

  return {
    // TV channels don't have episodes or multiple language tracks
    servers: defaultServer ? [defaultServer] : [],
    streamUrl: streamUrl, // Direct stream URL if found
  };
};
