import { load } from 'cheerio';

export const extractSearch = (html) => {
  const $ = load(html);

  const response = [];
  
  // Search results would be in similar structure to list page
  $('a.block.group, .grid a, a[href*="/live/"]').each((i, el) => {
    const obj = {
      title: null,
      id: null,
      poster: null,
      category: null,
    };

    // Extract title
    obj.title = $(el).find('.absolute.bottom-0 span, span.text-blue-100').text().trim();
    if (!obj.title) {
      obj.title = $(el).find('img').attr('alt') || $(el).text().trim();
    }

    // Extract ID from href
    const href = $(el).attr('href');
    if (href && href.includes('/live/')) {
      obj.id = href.replace('/live/', '').replace('/', '').split('?')[0];
    }

    // Extract poster
    const img = $(el).find('img');
    obj.poster = img.attr('src') || img.attr('data-src') || null;

    // Extract category - infer from channel ID or name
    if (obj.id || obj.title) {
      const channelId = (obj.id || '').toLowerCase();
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
      // Default to Trending if no match
      else {
        obj.category = 'Trending';
      }
    } else {
      obj.category = 'Trending';
    }

    if (obj.title && obj.id) {
      response.push(obj);
    }
  });

  return response;
};

