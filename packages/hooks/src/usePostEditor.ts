import { useCallback, useMemo, useState } from 'react';
import type { Post, ToastType } from '@post-manager/types';

interface UsePostEditorParams {
  onCreate: (data: Omit<Post, 'id'>) => Promise<Post>;
  onUpdate: (id: number, data: Partial<Post>) => Promise<Post>;
  onSuccess?: (message: string, type?: ToastType) => void;
  onError?: (message: string, type?: ToastType) => void;
}

interface UsePostEditorResult {
  editingPost: Post | null;
  isEditing: boolean;
  startEditing: (post: Post) => void;
  cancelEditing: () => void;
  submitPost: (data: Omit<Post, 'id'>) => Promise<void>;
}

export function usePostEditor({
  onCreate,
  onUpdate,
  onSuccess,
  onError,
}: UsePostEditorParams): UsePostEditorResult {
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const isEditing = useMemo(() => Boolean(editingPost), [editingPost]);

  const startEditing = useCallback((post: Post) => {
    setEditingPost(post);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingPost(null);
  }, []);

  const submitPost = useCallback(
    async (data: Omit<Post, 'id'>) => {
      try {
        if (editingPost) {
          await onUpdate(editingPost.id, data);
          onSuccess?.('Post updated successfully!', 'success');
        } else {
          await onCreate(data);
          onSuccess?.('Post created successfully!', 'success');
        }
        setEditingPost(null);
      } catch (error) {
        const message = editingPost
          ? 'Failed to update post'
          : 'Failed to create post';
        onError?.(message, 'error');
        throw error;
      }
    },
    [editingPost, onCreate, onError, onSuccess, onUpdate]
  );

  return {
    editingPost,
    isEditing,
    startEditing,
    cancelEditing,
    submitPost,
  };
}

