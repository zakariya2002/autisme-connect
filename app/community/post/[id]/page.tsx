'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CommunityPost, CommunityComment, CATEGORY_INFO } from '@/types/community';
import { getPostById, getComments, deletePost, reportContent } from '@/lib/community/actions';
import FamilyNavbar from '@/components/FamilyNavbar';
import EducatorNavbar from '@/components/EducatorNavbar';
import AuthorBadge from '@/components/community/AuthorBadge';
import ReactionButtons from '@/components/community/ReactionButtons';
import CommentSection from '@/components/community/CommentSection';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [userRole, setUserRole] = useState<'family' | 'educator' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUserId(session.user.id);

          // Check user role
          const { data: educator } = await supabase
            .from('educator_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (educator) {
            setUserRole('educator');
            setProfile(educator);
          } else {
            const { data: family } = await supabase
              .from('family_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (family) {
              setUserRole('family');
              setProfile(family);
              setFamilyId(family.id);
            }
          }
        }

        // Fetch post and comments
        const [postData, commentsData] = await Promise.all([
          getPostById(postId),
          getComments(postId)
        ]);

        if (!postData) {
          router.push('/community');
          return;
        }

        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, router]);

  const handleDelete = async () => {
    const result = await deletePost(postId);
    if (result.success) {
      router.push('/community');
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setIsReporting(true);
    const result = await reportContent('post', postId, reportReason);
    setIsReporting(false);
    if (result.success) {
      setShowReportModal(false);
      setReportReason('');
      alert('Merci pour votre signalement. Notre équipe va examiner ce contenu.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf9f4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#fdf9f4] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post non trouvé</h2>
          <Link href="/community" className="text-teal-600 hover:underline">
            Retour à la communauté
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[post.category];
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr });
  const fullDate = format(new Date(post.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr });
  const isAuthor = userId === post.author_id;

  return (
    <div className="min-h-screen bg-[#fdf9f4]">
      {/* Navbar */}
      {userRole === 'educator' ? (
        <EducatorNavbar profile={profile} />
      ) : userRole === 'family' ? (
        <FamilyNavbar profile={profile} familyId={familyId} userId={userId} />
      ) : (
        <nav className="z-40 flex-shrink-0" style={{ backgroundColor: '#027e7e' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 sm:h-20 items-center">
              <Link href="/">
                <img src="/images/logo-neurocare.svg" alt="NeuroCare" className="h-16 sm:h-20" />
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-white hover:text-teal-100 font-medium">Connexion</Link>
                <Link href="/auth/register" className="bg-white text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-teal-50">S'inscrire</Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la communauté
        </Link>

        {/* Post content */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Pinned indicator */}
          {post.is_pinned && (
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-white text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Post épinglé
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <AuthorBadge
                author={post.author}
                isAnonymous={post.is_anonymous}
                anonymousName={post.anonymous_name}
                authorRole={post.author_role}
                size="lg"
              />
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                {categoryInfo.icon} #{categoryInfo.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* Content */}
            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <span title={fullDate}>{timeAgo}</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.views_count} vue{post.views_count !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <ReactionButtons
                targetType="post"
                targetId={post.id}
                reactionsCount={post.reactions_count}
                userReactions={post.user_reactions}
                size="md"
              />

              <div className="flex items-center gap-2">
                {isAuthor && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
                {userId && !isAuthor && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Signaler
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Comments */}
        <CommentSection
          postId={post.id}
          comments={comments}
          isAuthenticated={!!userId}
        />
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer ce post ?</h3>
            <p className="text-gray-600 mb-6">Cette action est irréversible. Le post et tous ses commentaires seront supprimés.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signaler ce contenu</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Décrivez le problème..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 resize-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                disabled={isReporting || !reportReason.trim()}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isReporting ? 'Envoi...' : 'Signaler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
