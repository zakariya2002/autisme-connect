'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import {
  CommunityPost,
  CommunityComment,
  PostCategory,
  ReactionType,
  AuthorRole,
  CreatePostData,
  CreateCommentData,
  PostsQueryParams,
  PostsResponse,
  AuthorProfile,
} from '@/types/community';

// Create authenticated Supabase client for server actions
function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting in read-only context
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal in read-only context
          }
        },
      },
    }
  );
}

// Anonymous name generator
const ANONYMOUS_ADJECTIVES = [
  'Bienveillant', 'Courageux', 'Serein', 'Positif', 'Attentif',
  'Solidaire', 'Patient', 'Confiant', 'Persévérant', 'Optimiste'
];
const ANONYMOUS_NOUNS = [
  'Parent', 'Aidant', 'Membre', 'Ami', 'Soutien',
  'Compagnon', 'Allié', 'Pair', 'Proche', 'Guide'
];

function generateAnonymousName(): string {
  const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
  const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj} ${noun} ${num}`;
}

// Helper to get user's role
async function getUserRole(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string): Promise<AuthorRole> {
  // Check if user is an educator
  const { data: educator } = await supabase
    .from('educator_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (educator) return 'educator';
  return 'family';
}

// Helper to get author profile
// Type definitions for Supabase responses
interface EducatorProfileData {
  id: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
}

interface FamilyProfileData {
  id: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
}

async function getAuthorProfile(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  authorId: string,
  authorRole: AuthorRole
): Promise<AuthorProfile | null> {
  if (authorRole === 'educator') {
    const { data } = await supabase
      .from('educator_profiles')
      .select('id, first_name, last_name, photo_url')
      .eq('user_id', authorId)
      .single();

    const educatorData = data as EducatorProfileData | null;
    if (educatorData) {
      return {
        id: educatorData.id,
        first_name: educatorData.first_name,
        last_name: educatorData.last_name,
        avatar_url: educatorData.photo_url,
        is_verified: true,
        role: 'educator'
      };
    }
  } else {
    const { data } = await supabase
      .from('family_profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('user_id', authorId)
      .single();

    const familyData = data as FamilyProfileData | null;
    if (familyData) {
      return {
        id: familyData.id,
        first_name: familyData.first_name,
        last_name: familyData.last_name,
        avatar_url: familyData.avatar_url,
        is_verified: false,
        role: 'family'
      };
    }
  }
  return null;
}

// ============================================
// POSTS
// ============================================

export async function getPosts(params: PostsQueryParams = {}): Promise<PostsResponse> {
  const supabase = createSupabaseServerClient();

  const { category, search, page = 1, limit = 10, sortBy = 'recent' } = params;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('community_posts')
    .select('*', { count: 'exact' });

  // Filter by category
  if (category) {
    query = query.eq('category', category);
  }

  // Search in title and content
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  // Sort
  switch (sortBy) {
    case 'popular':
      query = query.order('views_count', { ascending: false });
      break;
    case 'comments':
      query = query.order('comments_count', { ascending: false });
      break;
    default:
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
  }

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], total: 0, page, totalPages: 0 };
  }

  // Fetch author profiles for non-anonymous posts
  const postsWithAuthors = await Promise.all(
    (posts || []).map(async (post) => {
      if (!post.is_anonymous) {
        const author = await getAuthorProfile(supabase, post.author_id, post.author_role);
        return { ...post, author };
      }
      return post;
    })
  );

  // Get current user's reactions
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const postIds = posts?.map(p => p.id) || [];
    const { data: reactions } = await supabase
      .from('community_reactions')
      .select('post_id, reaction_type')
      .eq('user_id', session.user.id)
      .in('post_id', postIds);

    if (reactions) {
      const reactionsByPost = reactions.reduce((acc, r) => {
        if (!acc[r.post_id]) acc[r.post_id] = [];
        acc[r.post_id].push(r.reaction_type);
        return acc;
      }, {} as Record<string, ReactionType[]>);

      postsWithAuthors.forEach(post => {
        post.user_reactions = reactionsByPost[post.id] || [];
      });
    }
  }

  return {
    posts: postsWithAuthors as CommunityPost[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

export async function getPostById(postId: string): Promise<CommunityPost | null> {
  const supabase = createSupabaseServerClient();

  const { data: post, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error('Error fetching post:', error);
    return null;
  }

  // Increment view count
  await supabase
    .from('community_posts')
    .update({ views_count: post.views_count + 1 })
    .eq('id', postId);

  // Get author profile if not anonymous
  let author = null;
  if (!post.is_anonymous) {
    author = await getAuthorProfile(supabase, post.author_id, post.author_role);
  }

  // Get current user's reactions
  let user_reactions: ReactionType[] = [];
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const { data: reactions } = await supabase
      .from('community_reactions')
      .select('reaction_type')
      .eq('user_id', session.user.id)
      .eq('post_id', postId);

    user_reactions = reactions?.map(r => r.reaction_type) || [];
  }

  return {
    ...post,
    author,
    user_reactions
  } as CommunityPost;
}

export async function createPost(data: CreatePostData): Promise<{ success: boolean; postId?: string; error?: string }> {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { success: false, error: 'Non authentifié' };
  }

  const authorRole = await getUserRole(supabase, session.user.id);
  const anonymousName = data.is_anonymous ? generateAnonymousName() : null;

  const { data: post, error } = await supabase
    .from('community_posts')
    .insert({
      author_id: session.user.id,
      author_role: authorRole,
      category: data.category,
      title: data.title,
      content: data.content,
      is_anonymous: data.is_anonymous,
      anonymous_name: anonymousName
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Erreur lors de la création du post' };
  }

  return { success: true, postId: post.id };
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { success: false, error: 'Non authentifié' };
  }

  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', session.user.id);

  if (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  return { success: true };
}

// ============================================
// COMMENTS
// ============================================

export async function getComments(postId: string): Promise<CommunityComment[]> {
  const supabase = createSupabaseServerClient();

  const { data: comments, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Build comment tree and get author profiles
  const commentsWithAuthors = await Promise.all(
    (comments || []).map(async (comment) => {
      let author = null;
      if (!comment.is_anonymous) {
        author = await getAuthorProfile(supabase, comment.author_id, comment.author_role);
      }
      return { ...comment, author, replies: [] };
    })
  );

  // Get current user's reactions
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const commentIds = comments?.map(c => c.id) || [];
    const { data: reactions } = await supabase
      .from('community_reactions')
      .select('comment_id, reaction_type')
      .eq('user_id', session.user.id)
      .in('comment_id', commentIds);

    if (reactions) {
      const reactionsByComment = reactions.reduce((acc, r) => {
        if (!acc[r.comment_id]) acc[r.comment_id] = [];
        acc[r.comment_id].push(r.reaction_type);
        return acc;
      }, {} as Record<string, ReactionType[]>);

      commentsWithAuthors.forEach(comment => {
        comment.user_reactions = reactionsByComment[comment.id] || [];
      });
    }
  }

  // Build nested structure
  const commentMap = new Map<string, CommunityComment>();
  const rootComments: CommunityComment[] = [];

  commentsWithAuthors.forEach(comment => {
    commentMap.set(comment.id, comment as CommunityComment);
  });

  commentsWithAuthors.forEach(comment => {
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(comment as CommunityComment);
      }
    } else {
      rootComments.push(comment as CommunityComment);
    }
  });

  return rootComments;
}

export async function addComment(data: CreateCommentData): Promise<{ success: boolean; commentId?: string; error?: string }> {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { success: false, error: 'Non authentifié' };
  }

  const authorRole = await getUserRole(supabase, session.user.id);
  const anonymousName = data.is_anonymous ? generateAnonymousName() : null;

  const { data: comment, error } = await supabase
    .from('community_comments')
    .insert({
      post_id: data.post_id,
      parent_comment_id: data.parent_comment_id || null,
      author_id: session.user.id,
      author_role: authorRole,
      content: data.content,
      is_anonymous: data.is_anonymous,
      anonymous_name: anonymousName
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: 'Erreur lors de la création du commentaire' };
  }

  return { success: true, commentId: comment.id };
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { success: false, error: 'Non authentifié' };
  }

  const { error } = await supabase
    .from('community_comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', session.user.id);

  if (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  return { success: true };
}

// ============================================
// REACTIONS
// ============================================

export async function toggleReaction(
  targetType: 'post' | 'comment',
  targetId: string,
  reactionType: ReactionType
): Promise<{ success: boolean; added: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { success: false, added: false, error: 'Non authentifié' };
  }

  const fieldName = targetType === 'post' ? 'post_id' : 'comment_id';

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('community_reactions')
    .select('id')
    .eq('user_id', session.user.id)
    .eq(fieldName, targetId)
    .eq('reaction_type', reactionType)
    .single();

  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from('community_reactions')
      .delete()
      .eq('id', existing.id);

    if (error) {
      console.error('Error removing reaction:', error);
      return { success: false, added: false, error: 'Erreur' };
    }
    return { success: true, added: false };
  } else {
    // Add reaction
    const insertData: Record<string, string> = {
      user_id: session.user.id,
      reaction_type: reactionType
    };
    insertData[fieldName] = targetId;

    const { error } = await supabase
      .from('community_reactions')
      .insert(insertData);

    if (error) {
      console.error('Error adding reaction:', error);
      return { success: false, added: false, error: 'Erreur' };
    }
    return { success: true, added: true };
  }
}

// ============================================
// REPORTS
// ============================================

export async function reportContent(
  targetType: 'post' | 'comment',
  targetId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { success: false, error: 'Non authentifié' };
  }

  const fieldName = targetType === 'post' ? 'post_id' : 'comment_id';
  const insertData: Record<string, string> = {
    reporter_id: session.user.id,
    reason
  };
  insertData[fieldName] = targetId;

  const { error } = await supabase
    .from('community_reports')
    .insert(insertData);

  if (error) {
    console.error('Error creating report:', error);
    return { success: false, error: 'Erreur lors du signalement' };
  }

  return { success: true };
}

// ============================================
// PREVIEW (for landing page)
// ============================================

export async function getRecentPosts(limit: number = 4): Promise<CommunityPost[]> {
  const supabase = createSupabaseServerClient();

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }

  // Fetch author profiles for non-anonymous posts
  const postsWithAuthors = await Promise.all(
    (posts || []).map(async (post) => {
      if (!post.is_anonymous) {
        const author = await getAuthorProfile(supabase, post.author_id, post.author_role);
        return { ...post, author };
      }
      return post;
    })
  );

  return postsWithAuthors as CommunityPost[];
}
