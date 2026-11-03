'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import {
  LayoutDashboard,
  Users,
  FileText,
  Code2,
  Calendar,
  Settings,
  Sparkles,
  MessageCircle,
  LogOut,
  User,
} from 'lucide-react';

function NavList() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Mock Interviews', href: '/interview/new', icon: Users },
    { name: 'Resume & ATS', href: '/interview/resume-check', icon: FileText },
    { name: 'Coding Sandbox', href: '/interview/new?stage=level_4_coding', icon: Code2 },
    { name: 'Calendar', href: '/dashboard', icon: Calendar },
    { name: 'Settings', href: '#', icon: Settings },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href.split('?')[0]);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'text-[#1c1e2d] font-semibold bg-[#f3f5fd]'
                : 'text-[#82889e] hover:text-[#1c1e2d] hover:bg-[#f8f9fd]'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? 'text-[#3b5bf5]' : 'text-[#9fa5bc]'
              }`}
            />
            <span>{item.name}</span>

            {isActive && (
              <span className="absolute right-0 top-1.5 bottom-1.5 w-1 bg-[#3b5bf5] rounded-l-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function LeftSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Do not render sidebar on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col justify-between p-5 border-r border-[#eaecf4] bg-white rounded-l-3xl">
      <div>
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-3 mb-6">
          <div className="w-7 h-7 rounded-lg bg-[#3b5bf5] flex items-center justify-center shadow-md shadow-blue-500/20 transform rotate-45">
            <Sparkles className="w-4 h-4 text-white transform -rotate-45" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#1c1e2d]">
            Interview<span className="text-[#3b5bf5]">AI</span>
          </span>
        </Link>

        {/* Navigation Menu wrapped in Suspense */}
        <Suspense fallback={<div className="h-48" />}>
          <NavList />
        </Suspense>
      </div>

      <div className="space-y-3">
        {/* User Card if logged in */}
        {user && (
          <div className="p-2.5 rounded-2xl bg-[#fafbfe] border border-[#eaecf4] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#3b5bf5] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#1c1e2d] block truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#82889e] block truncate capitalize">
                  {user.targetRole?.replace('_', ' ') || 'Candidate'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="text-[#82889e] hover:text-[#d93025] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom 24/7 Coach Card */}
        <div className="p-4 rounded-2xl bg-[#f4f6fc] border border-[#e8ecf6] text-center flex flex-col items-center">
          <div className="flex items-center -space-x-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-[#ff7373] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              👩
            </div>
            <div className="w-7 h-7 rounded-full bg-[#41b883] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              👨
            </div>
            <div className="w-7 h-7 rounded-full bg-[#3b5bf5] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
              👩‍💻
            </div>
          </div>

          <h4 className="text-xs font-bold text-[#1c1e2d]">AI Coach 24/7</h4>
          <p className="text-[11px] text-[#82889e] mt-0.5 mb-3 leading-tight">
            Practice interview anytime
          </p>

          <Link
            href="/interview/new"
            className="w-full py-2 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] text-white font-medium text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Start Practice</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
