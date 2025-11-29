import { memo } from 'react';
import type { Post } from '@post-manager/types';
import { PostList } from '../PostList';
import { PostForm } from '../PostForm';
import { LoadingSpinner } from '../LoadingSpinner';

export interface PostWorkspaceProps {
  posts: Post[];
  loading: boolean;
  editingPost: Post | null;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void | Promise<void>;
  onSubmit: (data: Omit<Post, 'id'>) => Promise<void>;
  onCancelEdit: () => void;
  itemsPerPage?: number;
}

function PostWorkspaceComponent({
  posts,
  loading,
  editingPost,
  onEdit,
  onDelete,
  onSubmit,
  onCancelEdit,
  itemsPerPage = 2,
}: PostWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr]">
      <section className="order-2 lg:order-1" aria-label="Posts list">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Posts
          </h2>
          {!loading && posts.length > 0 && (
            <span className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>
        {loading ? (
          <LoadingSpinner label="Loading posts..." />
        ) : (
          <PostList
            posts={posts}
            onEdit={onEdit}
            onDelete={onDelete}
            itemsPerPage={itemsPerPage}
          />
        )}
      </section>

      <section
        className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start"
        aria-label="Post form"
      >
        <PostForm
          post={editingPost}
          onSubmit={onSubmit}
          onCancel={onCancelEdit}
        />
      </section>
    </div>
  );
}

export const PostWorkspace = memo(PostWorkspaceComponent);

