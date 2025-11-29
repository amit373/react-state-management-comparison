import { create } from 'zustand';
import { postsApi } from '@post-manager/api';
import type { Post } from '@post-manager/types';

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  fetchPosts: () => Promise<void>;
  createPost: (data: Omit<Post, 'id'>) => Promise<Post>;
  updatePost: (id: number, data: Partial<Post>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await postsApi.getAll();
      set({ posts: data, loading: false });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch posts');
      set({ error, loading: false });
    }
  },

  createPost: async (data: Omit<Post, 'id'>): Promise<Post> => {
    const tempId = Date.now();
    const optimisticPost: Post = {
      id: tempId,
      ...data,
    };

    set((state) => ({
      posts: [optimisticPost, ...state.posts],
    }));

    try {
      const newPost = await postsApi.create(data);
      set((state) => ({
        posts: state.posts.map((p) => (p.id === tempId ? newPost : p)),
      }));
      return newPost;
    } catch (err) {
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== tempId),
        error: err instanceof Error ? err : new Error('Failed to create post'),
      }));
      throw err instanceof Error ? err : new Error('Failed to create post');
    }
  },

  updatePost: async (id: number, data: Partial<Post>): Promise<Post> => {
    const originalPost = get().posts.find((p) => p.id === id);
    if (!originalPost) {
      throw new Error('Post not found');
    }

    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));

    try {
      const updatedPost = await postsApi.update(id, data);
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? updatedPost : p)),
      }));
      return updatedPost;
    } catch (err) {
      if (originalPost) {
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? originalPost : p)),
          error:
            err instanceof Error ? err : new Error('Failed to update post'),
        }));
      }
      throw err instanceof Error ? err : new Error('Failed to update post');
    }
  },

  deletePost: async (id: number): Promise<void> => {
    const postToDelete = get().posts.find((p) => p.id === id);
    if (!postToDelete) {
      throw new Error('Post not found');
    }

    set((state) => ({
      posts: state.posts.filter((p) => p.id !== id),
    }));

    try {
      await postsApi.delete(id);
    } catch (err) {
      set((state) => ({
        posts: [...state.posts, postToDelete].sort((a, b) => a.id - b.id),
        error: err instanceof Error ? err : new Error('Failed to delete post'),
      }));
      throw err instanceof Error ? err : new Error('Failed to delete post');
    }
  },
}));
