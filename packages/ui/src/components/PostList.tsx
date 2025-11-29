import { useState, useMemo, useEffect, memo } from 'react';
import type { Post } from '@post-manager/types';
import { PostItem } from './PostItem';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';

export interface PostListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  itemsPerPage?: number;
}

function PostListComponent({
  posts,
  onEdit,
  onDelete,
  itemsPerPage = 2,
}: PostListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts;
    }
    const term = searchTerm.toLowerCase().trim();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        post.body.toLowerCase().includes(term)
    );
  }, [posts, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = useMemo(
    () => filteredPosts.slice(startIndex, endIndex),
    [filteredPosts, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search posts by title or content..."
      />

      {filteredPosts.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredPosts.length === posts.length
            ? `Showing all ${posts.length} posts`
            : `Found ${filteredPosts.length} of ${posts.length} posts`}
        </div>
      )}

      <div className="space-y-4" role="list" aria-label="Posts list">
        {filteredPosts.length === 0 ? (
          <div
            className="text-center py-12 px-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            role="status"
            aria-live="polite"
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {searchTerm
                ? 'No posts match your search criteria'
                : 'No posts found'}
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try adjusting your search terms
              </p>
            )}
          </div>
        ) : (
          paginatedPosts.map((post, index) => (
            <div
              key={post.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <PostItem post={post} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ))
        )}
      </div>

      {filteredPosts.length > itemsPerPage && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredPosts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export const PostList = memo(PostListComponent);

