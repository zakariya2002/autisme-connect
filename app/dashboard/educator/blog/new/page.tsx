'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BlogPostForm from '@/components/blog/BlogPostForm';
import EducatorMobileMenu from '@/components/EducatorMobileMenu';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push('/pro/login');
      return;
    }

    setUserId(session.user.id);

    const { data: profileData } = await supabase
      .from('educator_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdf9f4' }}>
        <div className="w-8 h-8 border-2 border-[#41005c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col" style={{ backgroundColor: '#fdf9f4' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40" style={{ backgroundColor: '#41005c' }}>
        <div className="flex items-center justify-between px-4 py-4 relative">
          <EducatorMobileMenu profile={profile} isPremium={false} onLogout={() => {}} />
          <Link href="/dashboard/educator" className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/images/logo-neurocare.svg" alt="NeuroCare" className="h-20" />
          </Link>
          <div className="w-10" />
        </div>
      </nav>

      {/* Header */}
      <div className="px-4 py-6" style={{ backgroundColor: '#5a1a75' }}>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/educator/blog"
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Nouvel article</h1>
            <p className="text-white/70 text-sm mt-0.5">Partagez vos connaissances</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <BlogPostForm userId={userId} mode="create" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto" style={{ backgroundColor: '#41005c', height: '40px' }} />
    </div>
  );
}
