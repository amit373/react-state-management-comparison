import { useCallback, Suspense } from 'react';
import {
  Layout,
  Toast,
  LoadingSpinner,
  PostWorkspace,
  ErrorBanner,
} from '@post-manager/ui';
import { usePosts } from './hooks/usePosts';
import { useToast, usePostEditor } from '@post-manager/hooks';

/**
 * Main App component with all business logic.
 * Uses React State + Props for state management.
 * Orchestrates posts management, toast notifications, and post editing.
 *
 * @returns {JSX.Element} Main application content with workspace and toast
 */
function App() {
  const { posts, loading, error, createPost, updatePost, deletePost } =
    usePosts();
  const { toast, showToast, hideToast } = useToast();

  const { editingPost, startEditing, cancelEditing, submitPost } =
    usePostEditor({
      onCreate: createPost,
      onUpdate: updatePost,
      onSuccess: showToast,
      onError: showToast,
    });

  /**
   * Handles post deletion with confirmation dialog.
   * Shows success/error toast notifications based on result.
   *
   * @param {number} id - ID of post to delete
   * @returns {Promise<void>}
   */
  const handleDelete = useCallback(
    async (id: number) => {
      const shouldDelete = window.confirm(
        'Are you sure you want to delete this post? This action cannot be undone.'
      );
      if (!shouldDelete) return;

      try {
        await deletePost(id);
        showToast('Post deleted successfully!', 'success');
      } catch (error) {
        showToast('Failed to delete post. Please try again.', 'error');
      }
    },
    [deletePost, showToast]
  );

  return (
    <Layout appName="React State + Props">
      {error && <ErrorBanner message={error.message} />}

      <Suspense fallback={<LoadingSpinner label="Loading workspace..." />}>
        <PostWorkspace
          posts={posts}
          loading={loading}
          editingPost={editingPost}
          onEdit={startEditing}
          onDelete={handleDelete}
          onSubmit={submitPost}
          onCancelEdit={cancelEditing}
          itemsPerPage={2}
        />
      </Suspense>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </Layout>
  );
}

export default App;
