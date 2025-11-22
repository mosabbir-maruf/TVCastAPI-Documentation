import { extractSearch } from '../extractor/extractSearch.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { NotFoundError, validationError } from '../utils/errors.js';

const searchController = async (c) => {
  const keyword = c.req.query('keyword') || null;
  const page = c.req.query('page') || 1;

  if (!keyword) throw new validationError('keyword query parameter is required');
  
  // Validate and sanitize keyword
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword.length === 0) {
    throw new validationError('keyword cannot be empty');
  }
  if (trimmedKeyword.length > 100) {
    throw new validationError('keyword is too long (max 100 characters)');
  }
  
  // Validate page number
  const pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
    throw new validationError('page must be a number between 1 and 1000');
  }

  // URL encode the keyword to prevent injection
  const encodedKeyword = encodeURIComponent(trimmedKeyword.toLowerCase().replace(/\s+/g, ' '));
  
  // TV site search uses query parameter 'q'
  const endpoint = `/?q=${encodedKeyword}`;
  // Search doesn't need stream info, so skip JWPlayer wait
  const result = await axiosInstance(endpoint, { needStreamInfo: false });

  if (!result.success) {
    throw new validationError('make sure given endpoint is correct');
  }

  if (!result.data) {
    throw new validationError('no data received from source');
  }

  const response = extractSearch(result.data);

  // Ensure response is an array
  if (!Array.isArray(response)) {
    throw new validationError('invalid response format');
  }

  if (response.length < 1) {
    throw new NotFoundError('no search results found');
  }

  return {
    pageInfo: {
      currentPage: pageNum,
      hasNextPage: false,
      totalPages: 1,
    },
    response: response,
  };
};

export default searchController;
