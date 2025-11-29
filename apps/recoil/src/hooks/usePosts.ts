import { useEffect } from 'react';
import {
  postsAtom,
  loadingAtom,
  errorAtom,
  fetchPostsAction,
  createPostAction,
  updatePostAction,
  deletePostAction,
} from '../store/postsState';
import { useRecoilState } from 'recoil';
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
 * Custom hook for managing posts with CRUD operations using Recoil.
 * Recoil provides atomic state management with selectors and atoms.
 * Implements optimistic updates for create, update, and delete operations.
 * On API error, the optimistic changes are rolled back.
 *
 * @returns {UsePostsReturn} Object containing posts array, loading state, error state, and CRUD methods
 */
export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useRecoilState(loadingAtom);
  const [error, setError] = useRecoilState(errorAtom);

  useEffect(() => {
    fetchPostsAction(setPosts, setLoading, setError);
  }, [setPosts, setLoading, setError]);

  const createPost = async (data: Omit<Post, 'id'>): Promise<Post> => {
    return createPostAction(data, posts, setPosts, setError);
  };

  const updatePost = async (id: number, data: Partial<Post>): Promise<Post> => {
    return updatePostAction(id, data, posts, setPosts, setError);
  };

  const deletePost = async (id: number): Promise<void> => {
    return deletePostAction(id, posts, setPosts, setError);
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
  };
}
