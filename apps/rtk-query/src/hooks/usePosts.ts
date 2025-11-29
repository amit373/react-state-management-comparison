import { useCallback } from 'react';
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '../api/postsApi';
import type { Post } from '@post-manager/types';

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  createPost: (data: Omit<Post, 'id'>) => Promise<Post>;
  updatePost: (id: number, data: Partial<Post>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

/**
 * Custom hook for managing posts with CRUD operations using RTK Query.
 * RTK Query handles caching, invalidation, and optimistic updates automatically.
 * The API calls are managed by RTK Query with automatic refetching and cache invalidation.
 *
 * @returns {UsePostsReturn} Object containing posts array, loading state, error state, and CRUD methods
 */
export function usePosts(): UsePostsReturn {
  const { data: posts = [], isLoading, error } = useGetPostsQuery();
  const [createPostMutation] = useCreatePostMutation();
  const [updatePostMutation] = useUpdatePostMutation();
  const [deletePostMutation] = useDeletePostMutation();

  /**
   * Creates a new post.
   * RTK Query automatically invalidates the cache and refetches posts.
   */
  const createPost = useCallback(
    async (data: Omit<Post, 'id'>): Promise<Post> => {
      try {
        const result = await createPostMutation(data).unwrap();
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to create post');
        throw error;
      }
    },
    [createPostMutation]
  );

  /**
   * Updates an existing post.
   * RTK Query automatically invalidates the cache and refetches the updated post.
   */
  const updatePost = useCallback(
    async (id: number, data: Partial<Post>): Promise<Post> => {
      try {
        const result = await updatePostMutation({ id, data }).unwrap();
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to update post');
        throw error;
      }
    },
    [updatePostMutation]
  );

  /**
   * Deletes a post.
   * RTK Query automatically invalidates the cache and refetches posts.
   */
  const deletePost = useCallback(
    async (id: number): Promise<void> => {
      try {
        await deletePostMutation(id).unwrap();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to delete post');
        throw error;
      }
    },
    [deletePostMutation]
  );

  return {
    posts,
    loading: isLoading,
    error: error
      ? 'data' in error && error.data instanceof Error
        ? error.data
        : new Error('Unknown error')
      : null,
    createPost,
    updatePost,
    deletePost,
  };
}
