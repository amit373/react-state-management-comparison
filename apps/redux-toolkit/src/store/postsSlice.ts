import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { postsApi } from '@post-manager/api';
import type { Post } from '@post-manager/types';

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: Error | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchPosts = createAsyncThunk('posts/fetchAll', async () => {
  return await postsApi.getAll();
});

export const createPostThunk = createAsyncThunk(
  'posts/create',
  async (data: Omit<Post, 'id'>) => {
    return await postsApi.create(data);
  }
);

export const updatePostThunk = createAsyncThunk(
  'posts/update',
  async ({ id, data }: { id: number; data: Partial<Post> }) => {
    return await postsApi.update(id, data);
  }
);

export const deletePostThunk = createAsyncThunk(
  'posts/delete',
  async (id: number) => {
    await postsApi.delete(id);
    return id;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Optimistic update for create
    optimisticCreate: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    rollbackCreate: (state, action: PayloadAction<number>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    // Optimistic update for update
    optimisticUpdate: (
      state,
      action: PayloadAction<{ id: number; data: Partial<Post> }>
    ) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload.data };
      }
    },
    rollbackUpdate: (
      state,
      action: PayloadAction<{ id: number; originalPost: Post }>
    ) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload.originalPost;
      }
    },
    // Optimistic update for delete
    optimisticDelete: (state, action: PayloadAction<number>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    rollbackDelete: (state, action: PayloadAction<Post>) => {
      state.posts.push(action.payload);
      state.posts.sort((a, b) => a.id - b.id);
    },
  },
  extraReducers: (builder) => {
    // Fetch posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error instanceof Error
            ? action.error
            : new Error('Failed to fetch posts');
      });
    // Create post
    builder
      .addCase(createPostThunk.fulfilled, (state, action) => {
        const tempId = state.posts.find((p) => p.id > 1000)?.id;
        if (tempId) {
          const index = state.posts.findIndex((p) => p.id === tempId);
          if (index !== -1) {
            state.posts[index] = action.payload;
          }
        }
      })
      .addCase(createPostThunk.rejected, () => {
        // Rollback handled by rollbackCreate action
      });
    // Update post
    builder
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(updatePostThunk.rejected, () => {
        // Rollback handled by rollbackUpdate action
      });
    // Delete post
    builder
      .addCase(deletePostThunk.fulfilled, () => {
        // Post already removed optimistically
      })
      .addCase(deletePostThunk.rejected, () => {
        // Rollback handled by rollbackDelete action
      });
  },
});

export const {
  optimisticCreate,
  rollbackCreate,
  optimisticUpdate,
  rollbackUpdate,
  optimisticDelete,
  rollbackDelete,
} = postsSlice.actions;

export default postsSlice.reducer;
