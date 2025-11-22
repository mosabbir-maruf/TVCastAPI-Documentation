import { extractHomepage } from '../extractor/extractHomepage.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { NotFoundError, validationError } from '../utils/errors.js';

const listpageController = async (c) => {
  // TV site categories
  const validateQueries = [
    'trending',
    'sports',
    'news',
    'documentary',
    'kids',
    'islamic',
  ];
  const queryParam = c.req.param('query');
  if (!queryParam || typeof queryParam !== 'string') {
    throw new validationError('query parameter is required', { validateQueries });
  }
  
  const query = queryParam.toLowerCase().trim();

  if (!validateQueries.includes(query))
    throw new validationError('invalid query', { validateQueries });

  const page = c.req.query('page') || 1;
  
  // Validate page number
  const pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
    throw new validationError('page must be a number between 1 and 1000');
  }

  // TV site uses homepage with categories, so we'll fetch homepage and filter
  const endpoint = `/`;

  // List page doesn't need stream info, so skip JWPlayer wait
  const result = await axiosInstance(endpoint, { needStreamInfo: false });

  if (!result.success) {
    throw new validationError('make sure given endpoint is correct');
  }

  if (!result.data) {
    throw new validationError('no data received from source');
  }
  
  const homepageData = extractHomepage(result.data);
  
  // Ensure homepageData is an object
  if (!homepageData || typeof homepageData !== 'object') {
    throw new validationError('invalid response format');
  }
  
  // Map query to homepage category
  const categoryMap = {
    'trending': 'trending',
    'sports': 'sports',
    'news': 'news',
    'documentary': 'documentary',
    'kids': 'kids',
    'islamic': 'islamic',
  };
  
  const category = categoryMap[query];
  const channels = homepageData[category] || [];
  
  // Return empty array instead of 404 - more API-friendly
  // Frontend can handle empty arrays gracefully
  return {
    pageInfo: {
      currentPage: pageNum,
      hasNextPage: false,
      totalPages: channels.length > 0 ? 1 : 0,
    },
    response: channels,
  };
};

export default listpageController;
