import { useCallback, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
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
 * Main app content component with all business logic.
 * Uses RTK Query for state management and API calls.
 */
function AppContent() {
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
    <Layout appName="RTK Query">
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

/**
 * Root App component with Redux Provider.
 */
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
