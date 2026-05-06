'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Map, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, isAuthenticated, initialized, signOut } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.replace('/auth/signin');
      return;
    }
    if (profile && !profile.is_admin) {
      toast.error('Access denied — admin only');
      router.replace('/');
    }
  }, [initialized, isAuthenticated, profile, router]);

  if (!initialized || !isAuthenticated || !profile?.is_admin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #D97706 100%)' }}
            >
              <span className="font-bold text-sm" style={{ color: '#451a03' }}>U</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Admin</p>
              <p className="text-xs text-gray-400 mt-0.5">Discover Udupi</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarLink href="/admin/trips" icon={<LayoutDashboard className="w-4 h-4" />} label="Trips" />
          <SidebarLink href="/" icon={<Map className="w-4 h-4" />} label="View Site" />
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Image
              src={profile.avatar_url ?? 'https://www.gravatar.com/avatar/?d=mp'}
              alt={profile.full_name ?? 'Admin'}
              width={28}
              height={28}
              className="rounded-full border border-gray-200"
            />
            <span className="text-xs font-medium text-gray-700 truncate">{profile.full_name ?? 'Admin'}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
