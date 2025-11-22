import * as cheerio from 'cheerio';

export const extractHomepage = (html) => {
  const $ = cheerio.load(html);

  const response = {
    trending: [],
    sports: [],
    news: [],
    documentary: [],
    kids: [],
    islamic: [],
    categories: [],
  };

  // Extract all channel categories - look for sections with mb-10 or mb-12
  $('.mb-10, .mb-12').each((i, el) => {
    // Find the category title - it's in a span with specific classes
    const categoryTitleEl = $(el).find('span.inline-flex, span').first();
    let categoryTitle = categoryTitleEl.text().trim();
    
    // If no title found, try to get from SVG or nearby text
    if (!categoryTitle) {
      categoryTitle = $(el).prev().find('span').text().trim() || 'Unknown';
    }
    
    const categoryName = categoryTitle.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    
    const channels = [];
    // Find all channel links in this section
    $(el).find('a.block.group, a[href*="/live/"]').each((j, channelEl) => {
      const channel = {
        title: null,
        id: null,
        poster: null,
        category: categoryTitle,
      };

      // Extract channel name from the span at the bottom or alt text
      channel.title = $(channelEl).find('.absolute.bottom-0 span, span.text-blue-100').text().trim();
      if (!channel.title) {
        channel.title = $(channelEl).find('img').attr('alt') || null;
      }
      
      // Extract channel ID from href (e.g., /live/t-sports -> t-sports)
      const href = $(channelEl).attr('href');
      if (href && href.includes('/live/')) {
        channel.id = href.replace('/live/', '').replace('/', '').split('?')[0];
      }

      // Extract poster/image
      const img = $(channelEl).find('img');
      channel.poster = img.attr('src') || img.attr('data-src') || null;

      if (channel.title && channel.id) {
        channels.push(channel);
      }
    });

    // Map to appropriate response property
    if (categoryName.includes('trending')) {
      response.trending = [...response.trending, ...channels];
    } else if (categoryName.includes('sport')) {
      response.sports = [...response.sports, ...channels];
    } else if (categoryName.includes('news')) {
      response.news = [...response.news, ...channels];
    } else if (categoryName.includes('documentary')) {
      response.documentary = [...response.documentary, ...channels];
    } else if (categoryName.includes('kids') || categoryName.includes('kid')) {
      response.kids = [...response.kids, ...channels];
    } else if (categoryName.includes('islamic') || categoryName.includes('islam')) {
      response.islamic = [...response.islamic, ...channels];
    } else {
      // Add to categories array for any other categories
      if (channels.length > 0) {
        response.categories.push({
          name: categoryTitle,
          channels: channels,
        });
      }
    }
  });

  // Also extract from the first section (Trending Channels)
  // Use Set for O(1) lookup instead of O(n) find()
  const trendingIds = new Set(response.trending.map(c => c.id));
  
  $('.mb-12').first().find('a.block.group').each((i, el) => {
    const channel = {
      title: null,
      id: null,
      poster: null,
      category: 'Trending Channels',
    };

    channel.title = $(el).find('.absolute.bottom-0 span').text().trim();
    const href = $(el).attr('href');
    if (href) {
      channel.id = href.replace('/live/', '').replace('/', '');
    }

    const img = $(el).find('img');
    channel.poster = img.attr('src') || img.attr('data-src') || null;

    if (channel.title && channel.id && !trendingIds.has(channel.id)) {
      response.trending.push(channel);
      trendingIds.add(channel.id); // Update set for future checks
    }
  });

  return response;
};
