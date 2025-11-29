import { useState, useEffect, memo, useCallback } from 'react';
import type { Post } from '@post-manager/types';

export interface PostFormProps {
  post?: Post | null;
  onSubmit: (data: Omit<Post, 'id'>) => Promise<void>;
  onCancel: () => void;
}

function PostFormComponent({ post, onSubmit, onCancel }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ title: false, body: false });

  const isEditMode = !!post;
  const titleError = touched.title && !title.trim();
  const bodyError = touched.body && !body.trim();
  const isFormValid = title.trim() && body.trim() && !isSubmitting;

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
      setUserId(post.userId);
      setTouched({ title: false, body: false });
    } else {
      setTitle('');
      setBody('');
      setUserId(1);
      setTouched({ title: false, body: false });
    }
  }, [post]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isFormValid) {
        setTouched({ title: true, body: true });
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          title: title.trim(),
          body: body.trim(),
          userId,
        });
        if (!isEditMode) {
          setTitle('');
          setBody('');
          setUserId(1);
          setTouched({ title: false, body: false });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, body, userId, isFormValid, onSubmit, isEditMode]
  );

  const handleBlur = useCallback((field: 'title' | 'body') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`p-2 rounded-lg ${
            isEditMode
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-green-100 dark:bg-green-900/30'
          }`}
        >
          {isEditMode ? (
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            User ID
          </label>
          <input
            id="userId"
            type="number"
            min="1"
            max="10"
            value={userId}
            onChange={(e) =>
              setUserId(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
            }
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
            aria-describedby="userId-description"
          />
          <p
            id="userId-description"
            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            Enter a user ID between 1 and 10
          </p>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Title{' '}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur('title')}
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all duration-200 ${
              titleError
                ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            required
            aria-invalid={titleError}
            aria-describedby={titleError ? 'title-error' : 'title-description'}
          />
          {titleError ? (
            <p
              id="title-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              Title is required
            </p>
          ) : (
            <p
              id="title-description"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              {title.length > 0 && (
                <span className="text-gray-600 dark:text-gray-400">
                  {title.length} character{title.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Content{' '}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onBlur={() => handleBlur('body')}
            rows={6}
            className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent resize-y transition-all duration-200 ${
              bodyError
                ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            required
            aria-invalid={bodyError}
            aria-describedby={bodyError ? 'body-error' : 'body-description'}
          />
          {bodyError ? (
            <p
              id="body-error"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              Content is required
            </p>
          ) : (
            <p
              id="body-description"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              {body.length > 0 && (
                <span className="text-gray-600 dark:text-gray-400">
                  {body.length} character{body.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={!isFormValid}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:hover:shadow-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isEditMode ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Update Post
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Post
                  </>
                )}
              </span>
            )}
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export const PostForm = memo(PostFormComponent);

