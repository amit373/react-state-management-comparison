import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post } from '@post-manager/types';
import { API_CONFIG } from '@post-manager/config';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_CONFIG.BASE_URL }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => API_CONFIG.ENDPOINTS.POSTS,
      providesTags: ['Post'],
    }),
    getPost: builder.query<Post, number>({
      query: (id) => `${API_CONFIG.ENDPOINTS.POSTS}/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation<Post, Omit<Post, 'id'>>({
      query: (data) => ({
        url: API_CONFIG.ENDPOINTS.POSTS,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
    }),
    updatePost: builder.mutation<Post, { id: number; data: Partial<Post> }>({
      query: ({ id, data }) => ({
        url: `${API_CONFIG.ENDPOINTS.POSTS}/${id}`,
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }],
    }),
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `${API_CONFIG.ENDPOINTS.POSTS}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;
