import { useState, useEffect, useCallback, ReactNode } from 'react';
import { postsApi } from '@post-manager/api';
import type { Post } from '@post-manager/types';
import { PostsContext } from './postsContext';

/**
 * @typedef {Object} PostsProviderProps
 * @property {ReactNode} children - Child components to render
 */
interface PostsProviderProps {
  children: ReactNode;
}

/**
 * PostsProvider component that manages posts state and CRUD operations.
 * Provides posts context to all child components.
 * Implements optimistic updates for better UX.
 *
 * @param {PostsProviderProps} props - Provider props
 * @returns {JSX.Element} Context provider with posts state
 *
 * @example
 * ```tsx
 * <PostsProvider>
 *   <App />
 * </PostsProvider>
 * ```
 */
export function PostsProvider({ children }: PostsProviderProps) {
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
        const error =
          err instanceof Error ? err : new Error('Failed to fetch posts');
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  /**
   * Creates a new post with optimistic update.
   * Adds post immediately, then replaces with server response.
   * Rolls back on error.
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
        const error =
          err instanceof Error ? err : new Error('Failed to create post');
        setError(error);
        throw error;
      }
    },
    []
  );

  /**
   * Updates an existing post with optimistic update.
   * Updates UI immediately, then syncs with server.
   * Rolls back on error.
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
        const error =
          err instanceof Error ? err : new Error('Failed to update post');
        setError(error);
        throw error;
      }
    },
    [posts]
  );

  /**
   * Deletes a post with optimistic update.
   * Removes from UI immediately, then confirms with server.
   * Restores on error.
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
        const error =
          err instanceof Error ? err : new Error('Failed to delete post');
        setError(error);
        throw error;
      }
    },
    [posts]
  );

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        createPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}
