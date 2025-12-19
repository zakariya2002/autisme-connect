'use client';

import { useState } from 'react';
import { CommunityComment } from '@/types/community';
import AuthorBadge from './AuthorBadge';
import ReactionButtons from './ReactionButtons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommentCardProps {
  comment: CommunityComment;
  onReply?: (commentId: string) => void;
  isReply?: boolean;
  className?: string;
}

export default function CommentCard({
  comment,
  onReply,
  isReply = false,
  className = ''
}: CommentCardProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: fr
  });

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''} ${className}`}>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <AuthorBadge
            author={comment.author}
            isAnonymous={comment.is_anonymous}
            anonymousName={comment.anonymous_name}
            authorRole={comment.author_role}
            size="sm"
          />
          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo}</span>
        </div>

        {/* Content */}
        <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <ReactionButtons
            targetType="comment"
            targetId={comment.id}
            reactionsCount={comment.reactions_count}
            userReactions={comment.user_reactions}
            size="sm"
          />
          {onReply && !isReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-gray-500 hover:text-teal-600 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Répondre
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
