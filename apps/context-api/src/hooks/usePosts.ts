import { useContext } from 'react';
import { PostsContext } from '../context/postsContext';

/**
 * Custom hook that exposes the PostsContext value.
 * Provides access to posts state and CRUD operations.
 * Throws a descriptive error when used outside of the provider boundary.
 *
 * @returns {PostsContextValue} Posts context value with state and operations
 * @throws {Error} If used outside of PostsProvider
 *
 * @example
 * ```tsx
 * const { posts, loading, createPost, updatePost, deletePost } = usePosts();
 * ```
 */
export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
