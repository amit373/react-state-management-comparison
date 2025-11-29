import { atom, selector } from 'recoil';
import { postsApi } from '@post-manager/api';
import type { Post } from '@post-manager/types';

export const postsAtom = atom<Post[]>({
  key: 'posts',
  default: [],
});

export const loadingAtom = atom<boolean>({
  key: 'loading',
  default: false,
});

export const errorAtom = atom<Error | null>({
  key: 'error',
  default: null,
});

export const postsSelector = selector({
  key: 'postsSelector',
  get: ({ get }) => get(postsAtom),
});

export async function fetchPostsAction(
  setPosts: (posts: Post[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
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
}

export async function createPostAction(
  data: Omit<Post, 'id'>,
  posts: Post[],
  setPosts: (posts: Post[]) => void,
  setError: (error: Error | null) => void
): Promise<Post> {
  const tempId = Date.now();
  const optimisticPost: Post = {
    id: tempId,
    ...data,
  };

  // Optimistic update
  setPosts([optimisticPost, ...posts]);

  try {
    const newPost = await postsApi.create(data);
    setPosts(posts.map((p) => (p.id === tempId ? newPost : p)));
    return newPost;
  } catch (err) {
    // Rollback
    setPosts(posts.filter((p) => p.id !== tempId));
    const error =
      err instanceof Error ? err : new Error('Failed to create post');
    setError(error);
    throw error;
  }
}

export async function updatePostAction(
  id: number,
  data: Partial<Post>,
  posts: Post[],
  setPosts: (posts: Post[]) => void,
  setError: (error: Error | null) => void
): Promise<Post> {
  const originalPost = posts.find((p) => p.id === id);
  if (!originalPost) {
    throw new Error('Post not found');
  }

  // Optimistic update
  setPosts(posts.map((p) => (p.id === id ? { ...p, ...data } : p)));

  try {
    const updatedPost = await postsApi.update(id, data);
    setPosts(posts.map((p) => (p.id === id ? updatedPost : p)));
    return updatedPost;
  } catch (err) {
    // Rollback
    setPosts(posts.map((p) => (p.id === id ? originalPost : p)));
    const error =
      err instanceof Error ? err : new Error('Failed to update post');
    setError(error);
    throw error;
  }
}

export async function deletePostAction(
  id: number,
  posts: Post[],
  setPosts: (posts: Post[]) => void,
  setError: (error: Error | null) => void
): Promise<void> {
  const postToDelete = posts.find((p) => p.id === id);
  if (!postToDelete) {
    throw new Error('Post not found');
  }

  // Optimistic update
  setPosts(posts.filter((p) => p.id !== id));

  try {
    await postsApi.delete(id);
  } catch (err) {
    // Rollback
    setPosts([...posts, postToDelete].sort((a, b) => a.id - b.id));
    const error =
      err instanceof Error ? err : new Error('Failed to delete post');
    setError(error);
    throw error;
  }
}
