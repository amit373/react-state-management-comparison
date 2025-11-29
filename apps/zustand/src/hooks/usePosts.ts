import { useEffect } from 'react';
import { usePostsStore } from '../store/postsStore';
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
 * Custom hook for managing posts with CRUD operations using Zustand.
 * Zustand provides a simple, lightweight state management solution.
 * Implements optimistic updates for create, update, and delete operations.
 * On API error, the optimistic changes are rolled back.
 *
 * @returns {UsePostsReturn} Object containing posts array, loading state, error state, and CRUD methods
 */
export function usePosts(): UsePostsReturn {
  const posts = usePostsStore((state) => state.posts);
  const loading = usePostsStore((state) => state.loading);
  const error = usePostsStore((state) => state.error);
  const fetchPosts = usePostsStore((state) => state.fetchPosts);
  const createPost = usePostsStore((state) => state.createPost);
  const updatePost = usePostsStore((state) => state.updatePost);
  const deletePost = usePostsStore((state) => state.deletePost);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
  };
}
