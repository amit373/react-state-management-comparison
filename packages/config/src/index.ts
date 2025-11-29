export const API_CONFIG = {
  BASE_URL: 'https://jsonplaceholder.typicode.com',
  ENDPOINTS: {
    POSTS: '/posts',
  },
  TIMEOUT: 10000,
} as const;

export const ERROR_MESSAGES = {
  FETCH_POSTS: 'Failed to fetch posts',
  CREATE_POST: 'Failed to create post',
  UPDATE_POST: 'Failed to update post',
  DELETE_POST: 'Failed to delete post',
  POST_NOT_FOUND: 'Post not found',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

