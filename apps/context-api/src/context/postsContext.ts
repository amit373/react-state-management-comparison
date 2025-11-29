import { createContext } from 'react';
import type { Post } from '@post-manager/types';

/**
 * @typedef {Object} PostsContextValue
 * @property {Post[]} posts - Array of all posts
 * @property {boolean} loading - Whether posts are currently being fetched
 * @property {Error | null} error - Current error state or null
 * @property {(data: Omit<Post, 'id'>) => Promise<Post>} createPost - Async function to create new post
 * @property {(id: number, data: Partial<Post>) => Promise<Post>} updatePost - Async function to update existing post
 * @property {(id: number) => Promise<void>} deletePost - Async function to delete post
 */
export interface PostsContextValue {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  createPost: (data: Omit<Post, 'id'>) => Promise<Post>;
  updatePost: (id: number, data: Partial<Post>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

/**
 * React context for posts state and operations.
 * Provides access to posts data and CRUD methods throughout the app.
 *
 * @type {React.Context<PostsContextValue | undefined>}
 */
export const PostsContext = createContext<PostsContextValue | undefined>(
  undefined
);
