'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopHeader } from '@/components/dashboard/top-header';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Phone,
  MessageSquare,
  Video,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardHome() {
  const [selectedDate, setSelectedDate] = useState(13);

  // 4 Target stages with percentage donuts
  const practiceStages = [
    {
      id: '1',
      number: '1',
      title: 'ATS Resume Scanner',
      subtitle: '(1 scan completed)',
      percentage: 75,
      color: '#3b5bf5',
      href: '/interview/resume-check',
    },
    {
      id: '2',
      number: '2',
      title: 'HR & Behavioral',
      subtitle: '(STAR method)',
      percentage: 25,
      color: '#ff6b6b',
      href: '/interview/new?stage=level_2_behavioral',
    },
    {
      id: '3',
      number: '3',
      title: 'Technical Screen',
      subtitle: '(Core CS concepts)',
      percentage: 78,
      color: '#38bdf8',
      href: '/interview/new?stage=level_3_tech_screen',
    },
    {
      id: '4',
      number: '4',
      title: 'Coding Sandbox',
      subtitle: '(Algorithms & DS)',
      percentage: 45,
      color: '#f59e0b',
      href: '/interview/new?stage=level_4_coding',
    },
  ];

  // Candidates / Mock Interview Progress Table
  const progressRows = [
    {
      name: 'John Doe',
      role: 'UI Designer',
      status: 'Tech interview',
      statusColor: 'text-[#3b5bf5] bg-[#3b5bf5]',
    },
    {
      name: 'Ella Clintion',
      role: 'Content designer',
      status: 'Task',
      statusColor: 'text-[#ff6b6b] bg-[#ff6b6b]',
    },
    {
      name: 'Mike Tyler',
      role: 'Node.js Developer',
      status: 'Resume review',
      statusColor: 'text-[#10b981] bg-[#10b981]',
    },
    {
      name: 'Marie Arch',
      role: 'Node.js Developer',
      status: 'Task',
      statusColor: 'text-[#ff6b6b] bg-[#ff6b6b]',
    },
    {
      name: 'Sandra Huffman',
      role: 'UX Designer',
      status: 'Final interview',
      statusColor: 'text-[#f59e0b] bg-[#f59e0b]',
    },
  ];

  // New Applicants / Interview Panel
  const applicants = [
    {
      name: 'Lewis S. Cunningham',
      applied: 'Applied for iOS Developer',
      avatar: '👨‍💻',
    },
    {
      name: 'Danny Nelson',
      applied: 'Applied for Node.js Developer',
      avatar: '👨‍💼',
    },
    {
      name: 'Jennifer Patterson',
      applied: 'Applied for Marketing Manager',
      avatar: '👩‍💼',
    },
    {
      name: 'Timothy Watson',
      applied: 'Applied for iOS Developer',
      avatar: '👨‍🦱',
    },
    {
      name: 'Kimberly Rutledge',
      applied: 'Applied for Junior UX Designer',
      avatar: '👩‍🎨',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafbfe]">
      {/* Top Header */}
      <TopHeader title="Dashboard" />

      {/* Main 2-Column Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
        {/* Center Main Dashboard Column (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
          {/* Blue Welcome Banner (Matching Reference Image) */}
          <div className="relative rounded-2xl bg-[#3b5bf5] p-6 sm:p-7 text-white overflow-hidden flex flex-col sm:flex-row items-center justify-between shadow-lg shadow-blue-500/15">
            <div className="z-10 max-w-sm">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Hello Rahul!
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1.5 leading-relaxed">
                You have 4 interview stages left to master. It is a lot of work for today! So let's start 😉
              </p>
              <Link
                href="/interview/new"
                className="inline-block mt-4 text-xs font-semibold text-white underline underline-offset-4 hover:text-blue-100 transition-colors"
              >
                review it!
              </Link>
            </div>

            {/* Illustration Graphic */}
            <div className="mt-4 sm:mt-0 sm:pr-4 flex items-center justify-center">
              <div className="w-36 h-28 relative flex items-center justify-center">
                {/* SVG Character illustration */}
                <svg viewBox="0 0 160 120" className="w-full h-full">
                  <ellipse cx="80" cy="115" rx="50" ry="6" fill="#2945d8" opacity="0.4" />
                  {/* Laptop */}
                  <rect x="50" y="65" width="48" height="30" rx="3" fill="#ffffff" />
                  <polygon points="42,95 106,95 98,100 50,100" fill="#d1d7e8" />
                  {/* Character Torso */}
                  <path d="M74,75 Q80,50 96,65 L106,105 L66,105 Z" fill="#ffb8b8" />
                  {/* Face */}
                  <circle cx="92" cy="42" r="14" fill="#ffd1c2" />
                  {/* Hair */}
                  <path d="M78,38 Q90,20 106,35 Q108,50 98,52 Z" fill="#2d2d44" />
                </svg>
              </div>
            </div>
          </div>

          {/* Section: "You need to hire" / Practice Stages */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-[#1c1e2d]">You need to prepare</h3>
              <Link
                href="/interview/new"
                className="text-xs text-[#82889e] hover:text-[#3b5bf5] font-medium"
              >
                see all
              </Link>
            </div>

            {/* 2x2 Grid of White Cards with mini Donut Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {practiceStages.map((st) => (
                <Link
                  key={st.id}
                  href={st.href}
                  className="p-4 rounded-2xl bg-white border border-[#edf0f7] hover:border-[#d9e1f5] hover:shadow-md hover:shadow-slate-200/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold font-mono text-[#1c1e2d]">
                      {st.number}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1c1e2d] group-hover:text-[#3b5bf5] transition-colors">
                        {st.title}
                      </h4>
                      <span className="text-[11px] text-[#82889e] block mt-0.5">
                        {st.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Circular Donut Progress Ring */}
                  <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#edf0f7]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        stroke={st.color}
                        strokeDasharray={`${st.percentage}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[9px] font-mono font-bold text-[#82889e]">
                      {st.percentage}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Recruitment progress (Table) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-[#1c1e2d]">Recruitment progress</h3>
              <Link
                href="/interview/new"
                className="px-3 py-1 rounded-lg bg-[#3b5bf5] text-white text-xs font-medium hover:bg-[#2e4de6] transition-colors"
              >
                See all
              </Link>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#edf0f7] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#f4f6fa] grid grid-cols-12 text-[11px] font-semibold text-[#82889e]">
                <div className="col-span-4">Full name</div>
                <div className="col-span-4">Profession</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="divide-y divide-[#f4f6fa]">
                {progressRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-3 grid grid-cols-12 items-center text-xs hover:bg-[#fafbfe] transition-colors"
                  >
                    <div className="col-span-4 font-medium text-[#1c1e2d]">{row.name}</div>
                    <div className="col-span-4 text-[#82889e]">{row.role}</div>
                    <div className="col-span-3 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${row.statusColor}`} />
                      <span className="text-[#51576f] text-[11px]">{row.status}</span>
                    </div>
                    <div className="col-span-1 text-right">
                      <button className="text-[#a6adbf] hover:text-[#1c1e2d] p-1">
                        <MoreVertical className="w-3.5 h-3.5 inline" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#eaecf4] bg-white p-6 sm:p-7 flex flex-col justify-between space-y-6">
          <div>
            {/* Calendar Widget (Matching Reference Image) */}
            <div className="mb-8">
              {/* Month Header */}
              <div className="flex items-center justify-between mb-4">
                <button className="p-1 text-[#82889e] hover:text-[#1c1e2d] transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h4 className="text-xs font-bold text-[#1c1e2d] tracking-wide">
                  March 2026
                </h4>
                <button className="p-1 text-[#82889e] hover:text-[#1c1e2d] transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#9fa5bc] uppercase mb-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Date Numbers Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Empty padding for start of month */}
                <span className="p-1.5 text-transparent">0</span>
                <span className="p-1.5 text-transparent">0</span>
                <span className="p-1.5 text-transparent">0</span>
                <span className="p-1.5 text-transparent">0</span>
                <span className="p-1.5 text-transparent">0</span>
                <span className="p-1.5 text-transparent">0</span>
                <span className="p-1.5 text-[#82889e]">1</span>

                {[
                  2, 3, 4, 5, 6, 7, 8,
                  9, 10, 11, 12, 13, 14, 15,
                  16, 17, 18, 19, 20, 21, 22,
                  23, 24, 25, 26, 27, 28, 29,
                  30, 31
                ].map((d) => {
                  const isSelected = d === selectedDate;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`h-7 w-7 mx-auto rounded-full flex flex-col items-center justify-center text-[11px] font-medium transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#3b5bf5] text-white font-bold shadow-md shadow-blue-500/30'
                          : 'text-[#51576f] hover:bg-[#f3f5fd]'
                      }`}
                    >
                      <span>{d}</span>
                      {d === 13 && !isSelected && (
                        <span className="absolute bottom-0.5 w-1 h-1 bg-[#3b5bf5] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* New Applicants Section (Matching Reference Image) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-[#1c1e2d]">New Applicants</h4>
                <Link href="/interview/new" className="text-xs text-[#82889e] hover:text-[#3b5bf5] font-medium">
                  see all
                </Link>
              </div>

              <div className="space-y-3.5">
                {applicants.map((app, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#f0f3fa] border border-[#e2e7f3] flex items-center justify-center text-xs">
                        {app.avatar}
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-[#1c1e2d] leading-tight">
                          {app.name}
                        </h5>
                        <span className="text-[10px] text-[#82889e] block">
                          {app.applied}
                        </span>
                      </div>
                    </div>

                    {/* Action Icons matching the image: Contact/Chat/Call */}
                    <div className="flex items-center gap-1 text-[#8fa3f8] opacity-80 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:text-[#3b5bf5] cursor-pointer" title="Message">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 hover:text-[#3b5bf5] cursor-pointer" title="Call">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
