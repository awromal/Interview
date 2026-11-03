'use client';

import React from 'react';
import { Search, Mail, Bell, ChevronDown } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
}

export function TopHeader({ title = 'Dashboard' }: TopHeaderProps) {
  return (
    <div className="h-16 px-8 flex items-center justify-between border-b border-[#f0f2f8]">
      <h1 className="text-xl font-bold tracking-tight text-[#1c1e2d]">{title}</h1>

      <div className="flex items-center gap-5">
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

        {/* Profile Avatar & Dropdown */}
        <div className="flex items-center gap-2 pl-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 to-rose-300 border-2 border-white shadow-sm flex items-center justify-center text-xs font-semibold overflow-hidden">
            <span role="img" aria-label="avatar">👩‍💼</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8e94aa] group-hover:text-[#1c1e2d] transition-colors" />
        </div>
      </div>
    </div>
  );
}
