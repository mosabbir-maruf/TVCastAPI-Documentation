import { axiosInstance } from '../services/axiosInstance.js';
import { validationError } from '../utils/errors.js';
import { extractHomepage } from '../extractor/extractHomepage.js';
import { Redis } from '@upstash/redis';

const homepageController = async () => {
  const isRedisEnv = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  
  // Check Redis cache if available
  if (isRedisEnv) {
    try {
      const redis = Redis.fromEnv();
      const homePageData = await redis.get('home');

      if (homePageData) {
        // If cached data is a string, parse it; otherwise return as-is
        return typeof homePageData === 'string' ? JSON.parse(homePageData) : homePageData;
      }
    } catch (redisError) {
      // If Redis fails, log error but continue with fetch (graceful degradation)
      if (process.env.NODE_ENV === 'development') {
        console.error('[homepageController] Redis error:', redisError.message);
      }
      // Continue to fetch from source
    }
  }

  // Cache miss - fetch from source
  const result = await axiosInstance('/', { needStreamInfo: false }); // Homepage doesn't need stream info

  if (!result.success) {
    throw new validationError(result.message);
  }

  if (!result.data) {
    throw new validationError('no data received from source');
  }
  
  const response = extractHomepage(result.data);
  
  // Ensure response is an object
  if (!response || typeof response !== 'object') {
    throw new validationError('invalid response format');
  }
  
  // Cache in Redis if available (with error handling)
  if (isRedisEnv) {
    try {
      const redis = Redis.fromEnv();
      await redis.set('home', JSON.stringify(response), {
        ex: 60 * 60 * 24, // 24 hours
      });
    } catch (redisError) {
      // If Redis set fails, log but don't fail the request (graceful degradation)
      if (process.env.NODE_ENV === 'development') {
        console.error('[homepageController] Redis set error:', redisError.message);
      }
    }
  }
  
  return response;
};

export default homepageController;
