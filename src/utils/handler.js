import { fail, success } from './response.js';

const handler = (fn) => {
  return async (c, next) => {
    try {
      const result = await fn(c, next);

      return success(c, result, null);
    } catch (error) {
      // Log error with context
      const errorContext = {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        path: c.req.path,
        method: c.req.method,
        statusCode: error.statusCode || 500,
      };
      console.error('Handler Error:', JSON.stringify(errorContext, null, 2));

      if (error.statusCode) {
        return fail(c, error.message, error.statusCode, error.details);
      }
      // Don't expose internal error details in production
      const message = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An internal server error occurred';
      return fail(c, message, 500);
    }
  };
};
export default handler;
