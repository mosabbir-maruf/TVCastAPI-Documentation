import { validationError } from '../utils/errors.js';
import { axiosInstance } from '../services/axiosInstance.js';
import { extractDetailpage } from '../extractor/extractDetailpage.js';

const buildPlayerLink = (url) => {
  if (!url) return null;
  return `/player?url=${encodeURIComponent(url)}`;
};

const streamController = async (c) => {
  const { id } = c.req.query();

  if (!id) throw new validationError('id query parameter is required');
  
  // Validate and sanitize ID
  const sanitizedId = id.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
  if (sanitizedId.length === 0 || sanitizedId.length > 100) {
    throw new validationError('invalid id format');
  }

  // For TV channels, get stream URL directly from channel detail page
  // Stream controller needs stream info, so we wait for JWPlayer
  const result = await axiosInstance(`/live/${sanitizedId}`, { needStreamInfo: true });
  if (!result.success) {
    throw new validationError(result.message, 'maybe id is incorrect : ' + sanitizedId);
  }

  if (!result.data) {
    throw new validationError('no data received from source');
  }
  
  const channelData = extractDetailpage(result.data, result.streamInfo);
  
  // Ensure channelData is an object
  if (!channelData || typeof channelData !== 'object') {
    throw new validationError('invalid response format');
  }
  
  if (!channelData.streamUrl) {
    throw new validationError('Stream URL not found for this channel', { id: sanitizedId });
  }
  
  return {
    link: {
      file: channelData.streamUrl,
    },
    streamingLink: channelData.streamUrl,
    player: buildPlayerLink(channelData.streamUrl),
    quality: {
      selectedServer: 'Live Stream',
      selectedQuality: 'auto',
      format: 'HLS',
      adaptive: true,
    },
    channel: {
      id: channelData.id,
      title: channelData.title,
      poster: channelData.poster,
    },
  };
};

export default streamController;
