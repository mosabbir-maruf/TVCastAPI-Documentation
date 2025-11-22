const apiDocumentation = {
  generalInfo: {
    baseUrl: 'https://your-api-domain.com/api/v1',
    documentationUrl: 'https://docs-tvcastapi.vercel.app/',
  },
  endpoints: [
    {
      name: 'Home',
      endpoint: '/home',
      hasParams: false,
      hasQueries: false,
      example: '/home',
      description:
        'Fetches the homepage content with TV channels organized by categories: trending, sports, news, documentary, kids, and islamic channels.',
    },
    {
      name: 'Channel Details',
      endpoint: '/channel/:id',
      hasParams: true,
      hasQueries: false,
      paramsList: ['channel-id (e.g., t-sports, bbc-news)'],
      example: '/channel/t-sports',
      description: 'Retrieves detailed information about a specific TV channel including stream URL.',
    },
    {
      name: 'Channels by Category',
      endpoint: '/channels/:query',
      hasParams: true,
      hasQueries: true,
      paramsList: ['trending', 'sports', 'news', 'documentary', 'kids', 'islamic'],
      queriesList: ['page'],
      defaultQueries: {
        page: 1,
      },
      example: '/channels/sports?page=1',
      description: 'Fetches channels for a specific category.',
    },
    {
      name: 'Categories',
      endpoint: '/categories/:query',
      hasParams: true,
      hasQueries: true,
      paramsList: ['trending', 'sports', 'news', 'documentary', 'kids', 'islamic'],
      queriesList: ['page'],
      defaultQueries: {
        page: 1,
      },
      example: '/categories/sports?page=1',
      description: 'Alternative endpoint for fetching channels by category.',
    },
    {
      name: 'Search Channels',
      endpoint: '/search',
      hasParams: false,
      hasQueries: true,
      queriesList: ['keyword', 'page'],
      defaultQueries: {
        page: 1,
      },
      example: '/search?keyword=bbc&page=1',
      description: 'Searches for TV channels by keyword.',
    },
    {
      name: 'Stream',
      endpoint: '/stream',
      hasParams: false,
      hasQueries: true,
      queriesList: ['id'],
      defaultQueries: {},
      example: '/stream?id=t-sports',
      description:
        'Gets the streaming URL for a TV channel. Returns the live stream URL with player link.',
    },
    {
      name: 'Servers',
      endpoint: '/servers',
      hasParams: false,
      hasQueries: true,
      queriesList: ['id'],
      example: '/servers?id=channel-id',
      description: 'Fetches available streaming servers for a channel.',
    },
  ],
};
export default apiDocumentation;
