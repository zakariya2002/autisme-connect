'use client';

import { useState, useTransition } from 'react';
import { CommunityComment } from '@/types/community';
import { addComment } from '@/lib/community/actions';
import CommentCard from './CommentCard';

interface CommentSectionProps {
  postId: string;
  comments: CommunityComment[];
  isAuthenticated: boolean;
  className?: string;
}

export default function CommentSection({
  postId,
  comments,
  isAuthenticated,
  className = ''
}: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [localComments, setLocalComments] = useState<CommunityComment[]>(comments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    startTransition(async () => {
      const result = await addComment({
        post_id: postId,
        content: newComment.trim(),
        is_anonymous: isAnonymous
      });

      if (result.success) {
        setNewComment('');
        setIsAnonymous(false);
        // Reload comments (in a real app, you'd add the comment optimistically)
        window.location.reload();
      }
    });
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setReplyContent('');
  };

  const submitReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    startTransition(async () => {
      const result = await addComment({
        post_id: postId,
        parent_comment_id: parentId,
        content: replyContent.trim(),
        is_anonymous: isAnonymous
      });

      if (result.success) {
        setReplyingTo(null);
        setReplyContent('');
        window.location.reload();
      }
    });
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {localComments.length} commentaire{localComments.length !== 1 ? 's' : ''}
      </h3>

      {/* New comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez votre avis ou posez une question..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none transition"
            />
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Poster anonymement</span>
              </label>
              <button
                type="submit"
                disabled={isPending || !newComment.trim()}
                className="px-5 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Envoi...' : 'Commenter'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-6">
          <p className="text-gray-600 mb-3">Connectez-vous pour participer à la discussion</p>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Se connecter
          </a>
        </div>
      )}

      {/* Comments list */}
      {localComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>Aucun commentaire pour l'instant</p>
          <p className="text-sm mt-1">Soyez le premier à partager votre avis !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localComments.map((comment) => (
            <div key={comment.id}>
              <CommentCard
                comment={comment}
                onReply={isAuthenticated ? handleReply : undefined}
              />
              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="ml-8 mt-3 pl-4 border-l-2 border-teal-200">
                  <div className="bg-teal-50 rounded-lg p-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Votre réponse..."
                      rows={2}
                      autoFocus
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none text-sm"
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => submitReply(comment.id)}
                        disabled={isPending || !replyContent.trim()}
                        className="px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isPending ? 'Envoi...' : 'Répondre'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
