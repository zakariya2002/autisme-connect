'use client';

import Link from 'next/link';
import { BlogPost, getCategoryInfo } from '@/types/blog';
import BlogStatusBadge from './BlogStatusBadge';

interface BlogPostCardProps {
  post: BlogPost;
  showStatus?: boolean;
  showActions?: boolean;
  onDelete?: (postId: string) => void;
  onSubmit?: (postId: string) => void;
  isDeleting?: boolean;
  isSubmitting?: boolean;
}

export default function BlogPostCard({
  post,
  showStatus = false,
  showActions = false,
  onDelete,
  onSubmit,
  isDeleting = false,
  isSubmitting = false,
}: BlogPostCardProps) {
  const categoryInfo = getCategoryInfo(post.category);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {post.image_url && (
        <div className="relative h-40 bg-gray-100">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {showStatus && (
            <div className="absolute top-3 right-3">
              <BlogStatusBadge status={post.status} />
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Category and status */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${categoryInfo.color}15`, color: categoryInfo.color }}
          >
            {categoryInfo.label}
          </span>
          {showStatus && !post.image_url && (
            <BlogStatusBadge status={post.status} />
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span>{formatDate(post.created_at)}</span>
          <span>•</span>
          <span>{post.read_time_minutes} min de lecture</span>
          {post.status === 'published' && (
            <>
              <span>•</span>
              <span>{post.views_count} vues</span>
            </>
          )}
        </div>

        {/* Rejection reason */}
        {post.status === 'rejected' && post.rejection_reason && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-red-800 mb-1">Motif du refus :</p>
            <p className="text-xs text-red-700">{post.rejection_reason}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {/* Edit button (for draft/rejected) */}
            {['draft', 'rejected'].includes(post.status) && (
              <Link
                href={`/dashboard/educator/blog/${post.id}/edit`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </Link>
            )}

            {/* Submit for review button (for draft) */}
            {post.status === 'draft' && onSubmit && (
              <button
                onClick={() => onSubmit(post.id)}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#41005c' }}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Soumettre
              </button>
            )}

            {/* View button (for published) */}
            {post.status === 'published' && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#41005c' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Voir
              </Link>
            )}

            {/* Delete button */}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Supprimer"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
