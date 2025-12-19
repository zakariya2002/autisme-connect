'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import {
  BlogPost,
  BlogPostsResult,
  CreateBlogPostData,
  UpdateBlogPostData,
  BlogPostsQueryParams,
  calculateReadTime,
} from '@/types/blog';

// Create Supabase client with service role for server actions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Helper to ensure unique slug
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const query = supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query.neq('id', excludeId);
    }

    const { data } = await query.single();

    if (!data) break;

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

// ==================== PUBLIC ACTIONS ====================

/**
 * Get published blog posts with pagination and filtering
 */
export async function getPublishedPosts(params: BlogPostsQueryParams = {}): Promise<BlogPostsResult> {
  const { category, search, page = 1, limit = 10 } = params;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      author:educator_profiles!author_id (
        id,
        first_name,
        last_name,
        profession_type,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching published posts:', error);
    return { posts: [], total: 0, totalPages: 0, currentPage: page };
  }

  return {
    posts: (data || []) as BlogPost[],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

/**
 * Get a single post by slug (public)
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      author:educator_profiles!author_id (
        id,
        first_name,
        last_name,
        profession_type,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }

  return data as BlogPost;
}

/**
 * Increment view count for a post
 */
export async function incrementViewCount(postId: string): Promise<void> {
  await supabaseAdmin.rpc('increment_blog_views', { post_id: postId });
}

// ==================== EDUCATOR ACTIONS ====================

/**
 * Get educator's own blog posts (all statuses)
 */
export async function getMyBlogPosts(
  userId: string,
  params: BlogPostsQueryParams = {}
): Promise<BlogPostsResult> {
  const { status, page = 1, limit = 10 } = params;
  const offset = (page - 1) * limit;

  // First get the educator profile ID
  const { data: profile } = await supabaseAdmin
    .from('educator_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return { posts: [], total: 0, totalPages: 0, currentPage: page };
  }

  let query = supabaseAdmin
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching my posts:', error);
    return { posts: [], total: 0, totalPages: 0, currentPage: page };
  }

  return {
    posts: (data || []) as BlogPost[],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

/**
 * Get a single post by ID (for editing)
 */
export async function getPostById(postId: string, userId: string): Promise<BlogPost | null> {
  // First get the educator profile ID
  const { data: profile } = await supabaseAdmin
    .from('educator_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .eq('author_id', profile.id)
    .single();

  if (error) {
    console.error('Error fetching post by id:', error);
    return null;
  }

  return data as BlogPost;
}

/**
 * Create a new blog post (as draft)
 */
export async function createBlogPost(
  userId: string,
  data: CreateBlogPostData
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    // Get educator profile
    const { data: profile } = await supabaseAdmin
      .from('educator_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return { success: false, error: 'Profil éducateur non trouvé' };
    }

    // Generate unique slug
    const baseSlug = generateSlug(data.title);
    const slug = await ensureUniqueSlug(baseSlug);

    // Calculate read time
    const readTime = calculateReadTime(data.content);

    // Insert post
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        author_id: profile.id,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        image_url: data.image_url,
        read_time_minutes: readTime,
        status: 'draft',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return { success: false, error: 'Erreur lors de la création de l\'article' };
    }

    revalidatePath('/dashboard/educator/blog');
    return { success: true, postId: post.id };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Update a blog post (only draft or rejected posts can be updated)
 */
export async function updateBlogPost(
  postId: string,
  userId: string,
  data: UpdateBlogPostData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get educator profile
    const { data: profile } = await supabaseAdmin
      .from('educator_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return { success: false, error: 'Profil éducateur non trouvé' };
    }

    // Check post ownership and status
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id, status, slug')
      .eq('id', postId)
      .eq('author_id', profile.id)
      .single();

    if (!existingPost) {
      return { success: false, error: 'Article non trouvé' };
    }

    if (!['draft', 'rejected'].includes(existingPost.status)) {
      return { success: false, error: 'Seuls les brouillons et articles refusés peuvent être modifiés' };
    }

    // Prepare update data
    const updateData: any = { ...data };

    // Regenerate slug if title changed
    if (data.title) {
      const baseSlug = generateSlug(data.title);
      updateData.slug = await ensureUniqueSlug(baseSlug, postId);
    }

    // Recalculate read time if content changed
    if (data.content) {
      updateData.read_time_minutes = calculateReadTime(data.content);
    }

    // If post was rejected, keep it as draft after update
    if (existingPost.status === 'rejected') {
      updateData.status = 'draft';
      updateData.rejection_reason = null;
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }

    revalidatePath('/dashboard/educator/blog');
    revalidatePath(`/dashboard/educator/blog/${postId}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Submit a post for review (draft -> pending)
 */
export async function submitForReview(
  postId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get educator profile
    const { data: profile } = await supabaseAdmin
      .from('educator_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return { success: false, error: 'Profil éducateur non trouvé' };
    }

    // Check post ownership and status
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id, status')
      .eq('id', postId)
      .eq('author_id', profile.id)
      .single();

    if (!existingPost) {
      return { success: false, error: 'Article non trouvé' };
    }

    if (existingPost.status !== 'draft') {
      return { success: false, error: 'Seuls les brouillons peuvent être soumis' };
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({ status: 'pending' })
      .eq('id', postId);

    if (error) {
      console.error('Error submitting for review:', error);
      return { success: false, error: 'Erreur lors de la soumission' };
    }

    revalidatePath('/dashboard/educator/blog');
    return { success: true };
  } catch (error) {
    console.error('Error submitting for review:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(
  postId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get educator profile
    const { data: profile } = await supabaseAdmin
      .from('educator_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return { success: false, error: 'Profil éducateur non trouvé' };
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', profile.id);

    if (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }

    revalidatePath('/dashboard/educator/blog');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

// ==================== ADMIN ACTIONS ====================

/**
 * Get pending posts for moderation
 */
export async function getPendingPosts(params: BlogPostsQueryParams = {}): Promise<BlogPostsResult> {
  const { page = 1, limit = 10 } = params;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      author:educator_profiles!author_id (
        id,
        first_name,
        last_name,
        profession_type,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching pending posts:', error);
    return { posts: [], total: 0, totalPages: 0, currentPage: page };
  }

  return {
    posts: (data || []) as BlogPost[],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

/**
 * Get a post for admin review (any status)
 */
export async function getPostForAdmin(postId: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      author:educator_profiles!author_id (
        id,
        first_name,
        last_name,
        profession_type,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post for admin:', error);
    return null;
  }

  return data as BlogPost;
}

/**
 * Approve a post (pending -> published)
 */
export async function approvePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error approving post:', error);
      return { success: false, error: 'Erreur lors de l\'approbation' };
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('Error approving post:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Reject a post (pending -> rejected)
 */
export async function rejectPost(
  postId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!reason.trim()) {
      return { success: false, error: 'Veuillez fournir un motif de refus' };
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
      })
      .eq('id', postId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error rejecting post:', error);
      return { success: false, error: 'Erreur lors du refus' };
    }

    revalidatePath('/admin/blog');
    return { success: true };
  } catch (error) {
    console.error('Error rejecting post:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Unpublish a post (published -> draft)
 */
export async function unpublishPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        status: 'draft',
        published_at: null,
      })
      .eq('id', postId)
      .eq('status', 'published');

    if (error) {
      console.error('Error unpublishing post:', error);
      return { success: false, error: 'Erreur lors de la dépublication' };
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('Error unpublishing post:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}
