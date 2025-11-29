import axios, { AxiosError, AxiosInstance } from 'axios';
import type { Post } from '@post-manager/types';
import { API_CONFIG, ERROR_MESSAGES } from '@post-manager/config';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error.response) {
      throw new Error(
        `Server error: ${error.response.status} ${error.response.statusText}`
      );
    }
    if (error.request) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
);

export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    try {
      const response = await apiClient.get<Post[]>(API_CONFIG.ENDPOINTS.POSTS);
      return response.data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.FETCH_POSTS);
    }
  },

  getById: async (id: number): Promise<Post> => {
    try {
      const response = await apiClient.get<Post>(
        `${API_CONFIG.ENDPOINTS.POSTS}/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : ERROR_MESSAGES.POST_NOT_FOUND
      );
    }
  },

  create: async (data: Omit<Post, 'id'>): Promise<Post> => {
    try {
      const response = await apiClient.post<Post>(
        API_CONFIG.ENDPOINTS.POSTS,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.CREATE_POST);
    }
  },

  update: async (id: number, data: Partial<Post>): Promise<Post> => {
    try {
      const response = await apiClient.put<Post>(
        `${API_CONFIG.ENDPOINTS.POSTS}/${id}`,
        {
          id,
          ...data,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.UPDATE_POST);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.POSTS}/${id}`);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.DELETE_POST);
    }
  },
};

