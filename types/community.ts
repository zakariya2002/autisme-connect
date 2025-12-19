// Types for NeuroCare Community Feature

export type PostCategory = 'conseils' | 'temoignages' | 'questions' | 'ressources';
export type ReactionType = 'utile' | 'soutien' | 'merci';
export type AuthorRole = 'family' | 'educator';

export interface ReactionsCount {
  utile: number;
  soutien: number;
  merci: number;
}

export interface AuthorProfile {
  id: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  role: AuthorRole;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  author_role: AuthorRole;
  category: PostCategory;
  title: string;
  content: string;
  is_anonymous: boolean;
  anonymous_name?: string;
  reactions_count: ReactionsCount;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Relations (populated by joins)
  author?: AuthorProfile;
  user_reactions?: ReactionType[];
}

export interface CommunityComment {
  id: string;
  post_id: string;
  parent_comment_id?: string;
  author_id: string;
  author_role: AuthorRole;
  content: string;
  is_anonymous: boolean;
  anonymous_name?: string;
  reactions_count: ReactionsCount;
  created_at: string;
  updated_at: string;
  // Relations (populated by joins)
  author?: AuthorProfile;
  replies?: CommunityComment[];
  user_reactions?: ReactionType[];
}

export interface CommunityReaction {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id: string;
  post_id?: string;
  comment_id?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

// Category display info
export const CATEGORY_INFO: Record<PostCategory, { label: string; icon: string; color: string }> = {
  conseils: { label: 'Conseils', icon: '💡', color: 'bg-amber-100 text-amber-800' },
  temoignages: { label: 'Témoignages', icon: '💬', color: 'bg-blue-100 text-blue-800' },
  questions: { label: 'Questions', icon: '❓', color: 'bg-purple-100 text-purple-800' },
  ressources: { label: 'Ressources', icon: '📚', color: 'bg-green-100 text-green-800' },
};

// Reaction display info
export const REACTION_INFO: Record<ReactionType, { label: string; icon: string }> = {
  utile: { label: 'Utile', icon: '👍' },
  soutien: { label: 'Soutien', icon: '💜' },
  merci: { label: 'Merci', icon: '🙏' },
};

// Form types
export interface CreatePostData {
  category: PostCategory;
  title: string;
  content: string;
  is_anonymous: boolean;
}

export interface CreateCommentData {
  post_id: string;
  parent_comment_id?: string;
  content: string;
  is_anonymous: boolean;
}

// Query params for fetching posts
export interface PostsQueryParams {
  category?: PostCategory;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'popular' | 'comments';
}

// API Response types
export interface PostsResponse {
  posts: CommunityPost[];
  total: number;
  page: number;
  totalPages: number;
}
