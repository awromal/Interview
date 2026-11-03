'use client';

import React, { useState } from 'react';
import { Search, Mail, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { UserProfileModal } from '@/components/auth/user-profile-modal';

interface TopHeaderProps {
  title?: string;
}

export function TopHeader({ title = 'Dashboard' }: TopHeaderProps) {
  const { user, logout, updateProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="h-16 px-6 sm:px-8 flex items-center justify-between border-b border-[#f0f2f8] bg-white">
        <h1 className="text-xl font-bold tracking-tight text-[#1c1e2d]">{title}</h1>

        <div className="flex items-center gap-3 sm:gap-4">
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
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>

            <div className="hidden sm:block">
              <span className="text-xs font-bold text-[#1c1e2d] block leading-tight">
                {user?.name || 'Sign In'}
              </span>
              <span className="text-[10px] text-[#8e94aa] block leading-tight">
                {user?.email || 'Candidate'}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#8e94aa] group-hover:text-[#1c1e2d] transition-colors" />
          </button>

          {/* Quick Logout Button */}
          {user && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-[#8e94aa] hover:text-[#d93025] hover:bg-[#fff2f2] rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProfileUpdated={(updated) => {
          if (updated) {
            updateProfile(updated);
          } else {
            logout();
          }
        }}
      />
    </>
  );
}
