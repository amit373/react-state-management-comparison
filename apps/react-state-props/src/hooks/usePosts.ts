import { useState, useEffect, useCallback } from 'react';
import { postsApi } from '@post-manager/api';
import type { Post } from '@post-manager/types';
import { ERROR_MESSAGES } from '@post-manager/config';
import { getErrorMessage } from '@post-manager/utils';

/**
 * @typedef {Object} UsePostsReturn
 * @property {Post[]} posts - Array of all posts
 * @property {boolean} loading - Whether posts are currently being fetched
 * @property {Error | null} error - Current error state or null
 * @property {(data: Omit<Post, 'id'>) => Promise<Post>} createPost - Async function to create new post
 * @property {(id: number, data: Partial<Post>) => Promise<Post>} updatePost - Async function to update existing post
 * @property {(id: number) => Promise<void>} deletePost - Async function to delete post
 */
interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  createPost: (data: Omit<Post, 'id'>) => Promise<Post>;
  updatePost: (id: number, data: Partial<Post>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

/**
 * Custom hook for managing posts with CRUD operations.
 * Uses React useState for state management with props drilling pattern.
 * Implements optimistic updates for create, update, and delete operations.
 * On API error, the optimistic changes are rolled back.
 *
 * @returns {UsePostsReturn} Object containing posts array, loading state, error state, and CRUD methods
 *
 * @example
 * ```tsx
 * const { posts, loading, createPost, updatePost, deletePost } = usePosts();
 * ```
 */
export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches all posts on component mount.
   * Sets loading state and handles errors appropriately.
   */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await postsApi.getAll();
        setPosts(data);
      } catch (err) {
        const error = new Error(
          getErrorMessage(err, ERROR_MESSAGES.FETCH_POSTS)
        );
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  /**
   * Creates a new post with optimistic update.
   * Immediately adds the post to the UI, then makes the API call.
   * On error, removes the optimistically added post.
   *
   * @param {Omit<Post, 'id'>} data - Post data without ID
   * @returns {Promise<Post>} Created post object
   * @throws {Error} If creation fails
   */
  const createPost = useCallback(
    async (data: Omit<Post, 'id'>): Promise<Post> => {
      const tempId = Date.now();
      const optimisticPost: Post = {
        id: tempId,
        ...data,
      };

      setPosts((prev) => [optimisticPost, ...prev]);

      try {
        const newPost = await postsApi.create(data);
        setPosts((prev) => prev.map((p) => (p.id === tempId ? newPost : p)));
        return newPost;
      } catch (err) {
        setPosts((prev) => prev.filter((p) => p.id !== tempId));
        const error = new Error(
          getErrorMessage(err, ERROR_MESSAGES.CREATE_POST)
        );
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * Updates an existing post with optimistic update.
   * Immediately updates the post in the UI, then makes the API call.
   * On error, reverts to the original post data.
   *
   * @param {number} id - Post ID to update
   * @param {Partial<Post>} data - Partial post data to update
   * @returns {Promise<Post>} Updated post object
   * @throws {Error} If post not found or update fails
   */
  const updatePost = useCallback(
    async (id: number, data: Partial<Post>): Promise<Post> => {
      const originalPost = posts.find((p) => p.id === id);
      if (!originalPost) {
        throw new Error('Post not found');
      }

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

      try {
        const updatedPost = await postsApi.update(id, data);
        setPosts((prev) => prev.map((p) => (p.id === id ? updatedPost : p)));
        return updatedPost;
      } catch (err) {
        if (originalPost) {
          setPosts((prev) => prev.map((p) => (p.id === id ? originalPost : p)));
        }
        const error = new Error(
          getErrorMessage(err, ERROR_MESSAGES.UPDATE_POST)
        );
        setError(error);
        throw error;
      }
    },
    [posts]
  );

  /**
   * Deletes a post with optimistic update.
   * Immediately removes the post from the UI, then makes the API call.
   * On error, restores the deleted post.
   *
   * @param {number} id - Post ID to delete
   * @returns {Promise<void>}
   * @throws {Error} If post not found or deletion fails
   */
  const deletePost = useCallback(
    async (id: number): Promise<void> => {
      const postToDelete = posts.find((p) => p.id === id);
      if (!postToDelete) {
        throw new Error('Post not found');
      }

      setPosts((prev) => prev.filter((p) => p.id !== id));

      try {
        await postsApi.delete(id);
      } catch (err) {
        setPosts((prev) => [...prev, postToDelete].sort((a, b) => a.id - b.id));
        const error = new Error(
          getErrorMessage(err, ERROR_MESSAGES.DELETE_POST)
        );
        setError(error);
        throw error;
      }
    },
    [posts]
  );

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
  };
}
