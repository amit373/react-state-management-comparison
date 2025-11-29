import { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { postsAtom, loadingAtom, errorAtom } from '../store/postsAtoms';
import { postsApi } from '@post-manager/api';
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
 * Custom hook for managing posts with CRUD operations using Jotai.
 * Jotai provides atomic state management with a minimal API.
 * Implements optimistic updates for create, update, and delete operations.
 * On API error, the optimistic changes are rolled back.
 *
 * @returns {UsePostsReturn} Object containing posts array, loading state, error state, and CRUD methods
 */
export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useAtom(postsAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await postsApi.getAll();
        setPosts(data);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to fetch posts');
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [setPosts, setLoading, setError]);

  /**
   * Creates a new post with optimistic update.
   * Immediately adds the post to the UI, then makes the API call.
   * On error, removes the optimistically added post.
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
        const error =
          err instanceof Error ? err : new Error('Failed to create post');
        setError(error);
        throw error;
      }
    },
    [setPosts, setError]
  );

  /**
   * Updates an existing post with optimistic update.
   * Immediately updates the post in the UI, then makes the API call.
   * On error, reverts to the original post data.
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
        const error =
          err instanceof Error ? err : new Error('Failed to update post');
        setError(error);
        throw error;
      }
    },
    [posts, setPosts, setError]
  );

  /**
   * Deletes a post with optimistic update.
   * Immediately removes the post from the UI, then makes the API call.
   * On error, restores the deleted post.
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
        const error =
          err instanceof Error ? err : new Error('Failed to delete post');
        setError(error);
        throw error;
      }
    },
    [posts, setPosts, setError]
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
