import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import {
  fetchPosts,
  createPostThunk,
  updatePostThunk,
  deletePostThunk,
  optimisticCreate,
  rollbackCreate,
  optimisticUpdate,
  rollbackUpdate,
  optimisticDelete,
  rollbackDelete,
} from '../store/postsSlice';
import type { Post } from '@post-manager/types';
import { useEffect } from 'react';

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
 * Custom hook for managing posts with CRUD operations using Redux Toolkit.
 * Implements optimistic updates for create, update, and delete operations.
 * On API error, the optimistic changes are rolled back using Redux actions.
 *
 * @returns {UsePostsReturn} Object containing posts array, loading state, error state, and CRUD methods
 *
 * @example
 * ```tsx
 * const { posts, loading, createPost, updatePost, deletePost } = usePosts();
 * ```
 */
export function usePosts(): UsePostsReturn {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.posts
  );

  /**
   * Fetches all posts on component mount.
   * Dispatches fetchPosts thunk to load initial data.
   */
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  /**
   * Creates a new post with optimistic update.
   * Immediately adds the post to the UI via optimistic action, then makes the API call.
   * On error, rolls back using rollbackCreate action.
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

      // Optimistic update
      dispatch(optimisticCreate(optimisticPost));

      try {
        const result = await dispatch(createPostThunk(data)).unwrap();
        return result;
      } catch (err) {
        // Rollback
        dispatch(rollbackCreate(tempId));
        const error =
          err instanceof Error ? err : new Error('Failed to create post');
        throw error;
      }
    },
    [dispatch]
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

      // Optimistic update
      dispatch(optimisticUpdate({ id, data }));

      try {
        const result = await dispatch(updatePostThunk({ id, data })).unwrap();
        return result;
      } catch (err) {
        // Rollback
        if (originalPost) {
          dispatch(rollbackUpdate({ id, originalPost }));
        }
        const error =
          err instanceof Error ? err : new Error('Failed to update post');
        throw error;
      }
    },
    [dispatch, posts]
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

      // Optimistic update
      dispatch(optimisticDelete(id));

      try {
        await dispatch(deletePostThunk(id)).unwrap();
      } catch (err) {
        // Rollback
        dispatch(rollbackDelete(postToDelete));
        const error =
          err instanceof Error ? err : new Error('Failed to delete post');
        throw error;
      }
    },
    [dispatch, posts]
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
