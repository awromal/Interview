'use client';

import React, { useState, useEffect } from 'react';
import { Search, Mail, Bell, ChevronDown, User } from 'lucide-react';
import { UserProfile } from '@/lib/types/interview';
import { UserProfileModal } from '@/components/auth/user-profile-modal';

interface TopHeaderProps {
  title?: string;
}

export function TopHeader({ title = 'Dashboard' }: TopHeaderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('interview_user');
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  return (
    <>
      <div className="h-16 px-8 flex items-center justify-between border-b border-[#f0f2f8] bg-white">
        <h1 className="text-xl font-bold tracking-tight text-[#1c1e2d]">{title}</h1>

        <div className="flex items-center gap-4 sm:gap-5">
          {/* Search */}
          <button
            className="text-[#8e94aa] hover:text-[#1c1e2d] transition-colors p-1.5 cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mail */}
          <button
            className="text-[#8e94aa] hover:text-[#1c1e2d] transition-colors p-1.5 cursor-pointer relative"
            title="Messages"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            className="text-[#8e94aa] hover:text-[#1c1e2d] transition-colors p-1.5 cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ff4d4f] rounded-full" />
          </button>

          {/* User Profile / Login Pill */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-xl hover:bg-[#f4f6fc] transition-colors cursor-pointer group text-left border border-transparent hover:border-[#e2e7f3]"
          >
            <div className="w-8 h-8 rounded-full bg-[#3b5bf5] text-white shadow-sm flex items-center justify-center text-xs font-bold flex-shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>

            <div className="hidden sm:block">
              <span className="text-xs font-bold text-[#1c1e2d] block leading-tight">
                {profile?.name || 'Sign In / Profile'}
              </span>
              <span className="text-[10px] text-[#8e94aa] block leading-tight">
                {profile?.email || 'Guest Candidate'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#8e94aa] group-hover:text-[#1c1e2d] transition-colors" />
          </button>
        </div>
      </div>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </>
  );
}
