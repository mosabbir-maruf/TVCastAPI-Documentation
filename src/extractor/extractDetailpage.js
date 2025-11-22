import { load } from 'cheerio';

export const extractDetailpage = (html, streamInfo = null) => {
  const $ = load(html);

  const obj = {
    title: null,
    id: null,
    poster: null,
    description: null,
    category: null,
    streamUrl: null,
  };

  // Extract channel title - try multiple selectors and strategies
  let title = null;
  
  // Strategy 1: Look for h1 tag
  const h1Title = $('h1').first().text().trim();
  if (h1Title && h1Title.length > 0) {
    title = h1Title;
  }
  
  // Strategy 2: Look for meta og:title
  if (!title) {
    const metaTitle = $('meta[property="og:title"]').attr('content');
    if (metaTitle && metaTitle.trim().length > 0) {
      title = metaTitle.trim();
    }
  }
  
  // Strategy 3: Look for channel name in specific classes
  if (!title || title.includes('MovieNestBD') || title.length < 3) {
    const channelNameSelectors = [
      '.font-semibold.text-blue-300',
      '.text-blue-300.font-semibold',
      '[class*="channel"] [class*="title"]',
      '[class*="channel-name"]',
      'h2',
      '.text-xl.font-bold',
      '.text-2xl.font-bold',
    ];
    
    for (const selector of channelNameSelectors) {
      const found = $(selector).first().text().trim();
      if (found && found.length > 2 && !found.toLowerCase().includes('home') && !found.includes('MovieNestBD')) {
        title = found;
        break;
      }
    }
  }
  
  // Clean up title - remove common suffixes/prefixes
  if (title) {
    // Remove "MovieNestBD" and related text
    title = title.replace(/MovieNestBD\s*TV?/gi, '').trim();
    title = title.replace(/\s*-\s*MovieNestBD.*$/i, '').trim();
    title = title.replace(/MovieNestBD.*$/i, '').trim();
    
    // Remove "Home" if it's at the end
    title = title.replace(/\s*Home\s*$/i, '').trim();
    
    // Remove extra whitespace
    title = title.replace(/\s+/g, ' ').trim();
    
    // If title is too short or still contains unwanted text, try to extract from page structure
    if (title.length < 2 || title.toLowerCase().includes('movienestbd')) {
      // Look for text in the main content area that looks like a channel name
      const mainContent = $('main, [class*="main"], [class*="content"]').first();
      const possibleTitles = mainContent.find('h1, h2, h3, [class*="title"], [class*="name"]');
      
      for (let i = 0; i < possibleTitles.length; i++) {
        const text = $(possibleTitles[i]).text().trim();
        if (text && text.length > 2 && text.length < 50 && 
            !text.toLowerCase().includes('home') && 
            !text.toLowerCase().includes('movienestbd') &&
            !text.toLowerCase().includes('watch') &&
            !text.toLowerCase().includes('stream')) {
          title = text;
          break;
        }
      }
    }
  }
  
  obj.title = title || null;
  
  // If title is too short or seems incomplete, try to derive from page content or ID
  if (!obj.title || obj.title.length < 3 || obj.title === 'T' || obj.title === 't') {
    // Try to find channel name in breadcrumbs or navigation
    const breadcrumbText = $('[class*="breadcrumb"], [class*="nav"]').text();
    const breadcrumbMatch = breadcrumbText.match(/([A-Z][a-zA-Z\s]+(?:Sports|News|Channel|TV)?)/);
    if (breadcrumbMatch && breadcrumbMatch[1] && breadcrumbMatch[1].length > 2) {
      obj.title = breadcrumbMatch[1].trim();
    }
    
    // If still no good title, look for any text that looks like a channel name
    if (!obj.title || obj.title.length < 3) {
      const allText = $('body').text();
      // Look for patterns like "T Sports", "BBC News", etc.
      const channelNamePattern = /\b([A-Z][a-zA-Z\s]{2,30}(?:Sports|News|TV|Channel|HD|Live)?)\b/g;
      const matches = [...allText.matchAll(channelNamePattern)];
      for (const match of matches) {
        const candidate = match[1].trim();
        if (candidate.length > 2 && 
            !candidate.toLowerCase().includes('home') &&
            !candidate.toLowerCase().includes('movienestbd') &&
            !candidate.toLowerCase().includes('watch') &&
            !candidate.toLowerCase().includes('stream')) {
          obj.title = candidate;
          break;
        }
      }
    }
  }

  // Extract poster - prefer from JWPlayer streamInfo, then meta tags, then images
  if (streamInfo && streamInfo.poster) {
    obj.poster = streamInfo.poster;
  } else {
    obj.poster = $('meta[property="og:image"]').attr('content') || null;
    if (!obj.poster) {
      // Look for channel poster image in the video/player section
      const videoSection = $('.relative.aspect-video, [class*="aspect-video"], [class*="player"]');
      const posterImg = videoSection.find('img').first();
      obj.poster = posterImg.attr('src') || posterImg.attr('data-src') || null;
      
      // If still not found, look for the main channel image (not in "Other Channels" section)
      // Optimize: only check first few images, not all
      if (!obj.poster) {
        const images = $('img').slice(0, 10); // Limit to first 10 images
        for (let i = 0; i < images.length; i++) {
          const el = images[i];
          const src = $(el).attr('src') || $(el).attr('data-src');
          if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('favicon') && src.startsWith('http')) {
            const parent = $(el).closest('a, .space-y-3, [class*="channel"]');
            const isInOtherChannels = parent.length > 0 && (
              parent.find('h2').text().includes('Other Channels') ||
              parent.closest('[class*="Other"]').length > 0
            );
            if (!isInOtherChannels) {
              obj.poster = src;
              break;
            }
          }
        }
      }
    }
  }

  // Extract description - look for the "About This Channel" section
  obj.description = $('meta[property="og:description"]').attr('content') || null;
  if (!obj.description) {
    // Find description in the "About This Channel" section
    const aboutSection = $('h2').filter((i, el) => {
      return $(el).text().trim().includes('About');
    });
    if (aboutSection.length) {
      const descText = aboutSection.next().find('p, .text-gray-300').first().text().trim();
      if (descText) {
        obj.description = descText;
      }
    }
    // Fallback: look for any paragraph with substantial text
    // Optimize: only check first few paragraphs
    if (!obj.description) {
      const paragraphs = $('p').slice(0, 5); // Limit to first 5 paragraphs
      for (let i = 0; i < paragraphs.length; i++) {
        const text = $(paragraphs[i]).text().trim();
        if (text && text.length > 50 && text.includes('watching')) {
          obj.description = text;
          break;
        }
      }
    }
  }

  // Extract category - try to find it from breadcrumb or page structure
  // The category might not be on the detail page, so we'll try to infer from channel ID/name
  const categoryText = $('.mb-6.flex.items-center.gap-2 span, [class*="category"], [class*="breadcrumb"]').first().text().trim();
  if (categoryText && (categoryText.includes('Sports') || categoryText.includes('News') || categoryText.includes('Trending') || categoryText.includes('Documentary') || categoryText.includes('Kids') || categoryText.includes('Islamic'))) {
    obj.category = categoryText.replace(' Channels', '').trim();
  }
  
  // If category not found, infer from channel ID or name
  if (!obj.category) {
    const channelId = obj.id || '';
    const channelName = (obj.title || '').toLowerCase();
    
    // Check for News channels
    if (channelId.includes('news') || channelId.includes('jazeera') || channelId.includes('bbc') || 
        channelId.includes('cnn') || channelId === 'dw' || channelId.includes('dw') || channelId.includes('sky-news') ||
        channelName.includes('news') || channelName.includes('jazeera') || channelName.includes('bbc') ||
        channelName === 'dw' || channelName.includes('dw')) {
      obj.category = 'News';
    }
    // Check for Sports channels
    else if (channelId.includes('sports') || channelId.includes('sport') ||
             channelName.includes('sports') || channelName.includes('sport')) {
      obj.category = 'Sports';
    }
    // Check for Documentary channels
    else if (channelId.includes('documentary') || channelId.includes('planet') || channelId.includes('discovery') ||
             channelId.includes('natgeo') || channelId.includes('national-geographic') ||
             channelName.includes('planet') || channelName.includes('discovery') || channelName.includes('documentary')) {
      obj.category = 'Documentary';
    }
    // Check for Kids channels
    else if (channelId.includes('kids') || channelId.includes('cartoon') || channelId.includes('disney') ||
             channelName.includes('kids') || channelName.includes('cartoon') || channelName.includes('disney')) {
      obj.category = 'Kids';
    }
    // Check for Islamic channels
    else if (channelId.includes('islamic') || channelId.includes('quran') || channelId.includes('islam') ||
             channelName.includes('islamic') || channelName.includes('quran') || channelName.includes('islam')) {
      obj.category = 'Islamic';
    }
    // Default fallback - check page text (but be more careful)
    else {
      const pageText = $('body').text().toLowerCase();
      // Only use page text if it's very clear (not just mentioning the word)
      if (pageText.includes('news channel') || pageText.includes('news network')) {
        obj.category = 'News';
      } else if (pageText.includes('sports channel') || pageText.includes('sports network')) {
        obj.category = 'Sports';
      } else if (pageText.includes('documentary channel')) {
        obj.category = 'Documentary';
      } else if (pageText.includes('kids channel')) {
        obj.category = 'Kids';
      } else if (pageText.includes('islamic channel')) {
        obj.category = 'Islamic';
      } else {
        // Final fallback: default to Trending if no category found
        obj.category = 'Trending';
      }
    }
  }
  
  // Ensure category is never null - default to Trending if still not set
  if (!obj.category) {
    obj.category = 'Trending';
  }

  // Extract stream URL - prefer from JWPlayer streamInfo, otherwise try to extract from HTML
  if (streamInfo && streamInfo.streamUrl) {
    obj.streamUrl = streamInfo.streamUrl;
  } else {
    // Look for iframe (even if src is empty, it might be set dynamically)
    const iframe = $('iframe').first();
    if (iframe.length) {
      obj.streamUrl = iframe.attr('src') || iframe.attr('data-src') || iframe.attr('data-actual-src') || null;
      
      // If iframe src is not set, check if there's a data attribute or look in scripts
      // Optimize: only check script tags that might contain JWPlayer config
      if (!obj.streamUrl) {
        const scripts = $('script').slice(0, 10); // Limit to first 10 scripts
        for (let i = 0; i < scripts.length; i++) {
          const scriptContent = $(scripts[i]).html() || '';
          if (scriptContent.includes('jwplayer') || scriptContent.includes('file') || scriptContent.includes('sources')) {
            // Try to extract URL from script
            const urlMatch = scriptContent.match(/https?:\/\/[^\s"']+\.(m3u8|mp4|flv|ts)/i);
            if (urlMatch) {
              obj.streamUrl = urlMatch[0];
              break;
            }
            
            // Look for JWPlayer setup with file property
            const fileMatch = scriptContent.match(/file\s*[:=]\s*["']([^"']+)["']/i);
            if (fileMatch) {
              obj.streamUrl = fileMatch[1];
              break;
            }
          }
        }
      }
    }
  }

  // Extract ID from URL path if available (most reliable)
  // Look for /live/{id} pattern in the page
  const urlMatch = html.match(/\/live\/([^\/\s"']+)/i);
  if (urlMatch && urlMatch[1]) {
    obj.id = urlMatch[1].split('?')[0].split('#')[0]; // Remove query params and hash
  }
  
  // Also check meta tags for canonical URL
  if (!obj.id) {
    const canonicalUrl = $('link[rel="canonical"]').attr('href');
    if (canonicalUrl) {
      const canonicalMatch = canonicalUrl.match(/\/live\/([^\/\s"']+)/i);
      if (canonicalMatch && canonicalMatch[1]) {
        obj.id = canonicalMatch[1].split('?')[0].split('#')[0];
      }
    }
  }
  
  // Extract ID from page structure or title (fallback)
  // If we have a title but no ID, try to extract from title
  if (obj.title && !obj.id) {
    obj.id = obj.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  // Final fallback: If title is too short or just "T"/"t", try to derive from ID
  if ((!obj.title || obj.title.length < 3 || obj.title === 'T' || obj.title === 't') && obj.id) {
    // Convert ID like "t-sports" to "T Sports"
    const idParts = obj.id.split('-');
    const formattedTitle = idParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    // Only use this if it makes sense (not just a single letter)
    if (formattedTitle.length > 2) {
      obj.title = formattedTitle;
    }
  }

  return obj;
};
