'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BlogPost, BlogCategory, BLOG_CATEGORIES, CreateBlogPostData, generateExcerpt } from '@/types/blog';
import { createBlogPost, updateBlogPost, submitForReview } from '@/lib/blog/actions';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';

interface BlogPostFormProps {
  userId: string;
  existingPost?: BlogPost;
  mode: 'create' | 'edit';
}

export default function BlogPostForm({ userId, existingPost, mode }: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(existingPost?.title || '');
  const [content, setContent] = useState(existingPost?.content || '');
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt || '');
  const [category, setCategory] = useState<BlogCategory>(existingPost?.category || 'conseils');
  const [imageUrl, setImageUrl] = useState(existingPost?.image_url || '');
  const [autoExcerpt, setAutoExcerpt] = useState(!existingPost?.excerpt);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-generate excerpt when content changes (if auto mode is on)
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (autoExcerpt) {
      setExcerpt(generateExcerpt(newContent, 200));
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Le titre est requis');
      return false;
    }
    if (title.length > 200) {
      setError('Le titre ne doit pas dépasser 200 caractères');
      return false;
    }
    if (!content.trim() || content === '<p><br></p>') {
      setError('Le contenu est requis');
      return false;
    }
    if (!excerpt.trim()) {
      setError('L\'extrait est requis');
      return false;
    }
    if (excerpt.length > 500) {
      setError('L\'extrait ne doit pas dépasser 500 caractères');
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    startTransition(async () => {
      const data: CreateBlogPostData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        category,
        image_url: imageUrl || undefined,
      };

      let result: { success: boolean; postId?: string; error?: string } | undefined;
      if (mode === 'create') {
        result = await createBlogPost(userId, data);
      } else if (existingPost) {
        result = await updateBlogPost(existingPost.id, userId, data);
      }

      if (result?.success) {
        setSuccess('Article enregistré');
        if (mode === 'create' && result.postId) {
          router.push(`/dashboard/educator/blog/${result.postId}/edit`);
        }
      } else {
        setError(result?.error || 'Une erreur est survenue');
      }
    });
  };

  const handleSubmitForReview = () => {
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    startTransition(async () => {
      // First save the changes
      const data: CreateBlogPostData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        category,
        image_url: imageUrl || undefined,
      };

      let saveResult;
      if (mode === 'create') {
        saveResult = await createBlogPost(userId, data);
        if (!saveResult.success || !saveResult.postId) {
          setError(saveResult.error || 'Erreur lors de la sauvegarde');
          return;
        }

        // Submit the newly created post
        const submitResult = await submitForReview(saveResult.postId, userId);
        if (submitResult.success) {
          setSuccess('Article soumis pour validation');
          router.push('/dashboard/educator/blog');
        } else {
          setError(submitResult.error || 'Erreur lors de la soumission');
        }
      } else if (existingPost) {
        saveResult = await updateBlogPost(existingPost.id, userId, data);
        if (!saveResult.success) {
          setError(saveResult.error || 'Erreur lors de la sauvegarde');
          return;
        }

        // Submit the existing post
        const submitResult = await submitForReview(existingPost.id, userId);
        if (submitResult.success) {
          setSuccess('Article soumis pour validation');
          router.push('/dashboard/educator/blog');
        } else {
          setError(submitResult.error || 'Erreur lors de la soumission');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Error/Success messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de l'article *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Les bienfaits de la musicothérapie pour les enfants TSA"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#41005c] focus:ring-2 focus:ring-purple-100 transition-all"
          maxLength={200}
        />
        <div className="mt-1 text-xs text-gray-500 text-right">
          {title.length}/200
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie *
        </label>
        <div className="flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={category === cat.value ? { backgroundColor: cat.color } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <ImageUpload
        currentImageUrl={imageUrl}
        onImageUploaded={setImageUrl}
        onError={setError}
      />

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contenu de l'article *
        </label>
        <RichTextEditor
          value={content}
          onChange={handleContentChange}
          placeholder="Rédigez votre article... Utilisez les outils de mise en forme pour structurer votre contenu."
        />
      </div>

      {/* Excerpt */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Extrait / Résumé *
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoExcerpt}
              onChange={(e) => setAutoExcerpt(e.target.checked)}
              className="rounded border-gray-300 text-[#41005c] focus:ring-[#41005c]"
            />
            Générer automatiquement
          </label>
        </div>
        <textarea
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            setAutoExcerpt(false);
          }}
          placeholder="Court résumé qui apparaîtra dans la liste des articles..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#41005c] focus:ring-2 focus:ring-purple-100 transition-all resize-none"
          maxLength={500}
        />
        <div className="mt-1 text-xs text-gray-500 text-right">
          {excerpt.length}/500
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isPending}
          className="flex-1 sm:flex-none px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          )}
          Enregistrer le brouillon
        </button>
        <button
          type="button"
          onClick={handleSubmitForReview}
          disabled={isPending}
          className="flex-1 sm:flex-none px-6 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#41005c' }}
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          Soumettre pour validation
        </button>
      </div>

      {/* Info box */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[#41005c] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Comment ça marche ?</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Enregistrez votre article comme brouillon pour y revenir plus tard</li>
              <li>• Soumettez-le pour validation quand il est prêt</li>
              <li>• Notre équipe vérifiera le contenu avant publication</li>
              <li>• Vous serez notifié de la décision (publication ou demande de modifications)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
