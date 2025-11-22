import { extractDetailpage } from '../extractor/extractDetailpage.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { validationError } from '../utils/errors.js';

const detailpageController = async (c) => {
  const id = c.req.param('id');
  
  // Validate channel ID
  if (!id || typeof id !== 'string') {
    throw new validationError('channel id is required');
  }
  
  // Sanitize ID - prevent path traversal and ensure it's a valid channel ID
  const sanitizedId = id.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
  if (sanitizedId.length === 0 || sanitizedId.length > 100) {
    throw new validationError('invalid channel id format');
  }
  
  // TV site uses /live/{channel-id} format
  // Detail pages need stream info, so we wait for JWPlayer
  const result = await axiosInstance(`/live/${sanitizedId}`, { needStreamInfo: true });
  if (!result.success) {
    throw new validationError(result.message, 'maybe id is incorrect : ' + sanitizedId);
  }

  if (!result.data) {
    throw new validationError('no data received from source');
  }

  const response = extractDetailpage(result.data, result.streamInfo);
  
  // Ensure response is an object
  if (!response || typeof response !== 'object') {
    throw new validationError('invalid response format');
  }
  
  // Ensure ID is set
  if (!response.id) {
    response.id = sanitizedId;
  }

  return response;
};

export default detailpageController;
