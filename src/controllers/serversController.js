import { validationError } from '../utils/errors.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { extractServers } from '../extractor/extractServers.js';

export const getServers = async (id) => {
  // For TV channels, fetch the channel page directly
  // ID format: channel-id (e.g., t-sports)
  
  // Validate ID
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new validationError('id is required');
  }
  
  try {
    // Servers controller needs stream info, so we wait for JWPlayer
    const result = await axiosInstance(`/live/${id}`, { needStreamInfo: true });
    
    if (!result.success) {
      throw new validationError(result.message);
    }

    if (!result.data) {
      throw new validationError('no data received from source');
    }

    const response = extractServers(result.data, result.streamInfo);
    
    // Ensure response is an object
    if (!response || typeof response !== 'object') {
      throw new validationError('invalid response format');
    }
    
    return response;
  } catch (err) {
    // If it's already a validationError, re-throw it
    if (err instanceof validationError) {
      throw err;
    }
    
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('[serversController] Error:', err.message);
    }
    throw new validationError('make sure given endpoint is correct', {
      validIdEx: 't-sports',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const serversController = async (c) => {
  const id = c.req.query('id');

  if (!id) throw new validationError('id query parameter is required');
  
  // Validate and sanitize ID
  const sanitizedId = id.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
  if (sanitizedId.length === 0 || sanitizedId.length > 100) {
    throw new validationError('invalid id format');
  }

  const response = await getServers(sanitizedId);

  return response;
};

export default serversController;
