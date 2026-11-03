'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopHeader } from '@/components/dashboard/top-header';
import { Clock, Award, ArrowRight } from 'lucide-react';
import { InterviewSession } from '@/lib/types/interview';

export default function DashboardCalendarPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  useEffect(() => {
    const found: InterviewSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('interview_session_')) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || '{}');
          if (val && val.id) {
            found.push(val);
          }
        } catch {}
      }
    }
    setSessions(found.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafbfe]">
      <TopHeader title="Calendar & Past Sessions" />

      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0f2f8]">
          <div>
            <h1 className="text-xl font-bold text-[#1c1e2d]">Session History & Schedule</h1>
            <p className="text-xs text-[#82889e] mt-0.5">
              Review your past mock interviews and test results.
            </p>
          </div>

          <Link
            href="/interview/new"
            className="px-4 py-2 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            New Mock Session
          </Link>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-2xl border border-[#edf0f7] p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c1e2d] mb-4">
            Recent Practice Rounds
          </h2>

          {sessions.length > 0 ? (
            <div className="space-y-2.5">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1c1e2d] capitalize">
                        {sess.targetRole.replace('_', ' ')}
                      </span>
                      <span className="text-[#82889e]">•</span>
                      <span className="text-xs text-[#82889e] capitalize">{sess.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#82889e] text-[11px] mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sess.scorecard && (
                      <span className="font-mono text-[#3b5bf5] font-bold text-sm">
                        {sess.scorecard.overallScore}/100
                      </span>
                    )}
                    <Link
                      href={sess.scorecard ? `/interview/${sess.id}/report` : `/interview/${sess.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#e2e7f3] text-[#1c1e2d] font-medium text-xs hover:border-[#3b5bf5] transition-colors"
                    >
                      {sess.scorecard ? 'View Scorecard' : 'Resume'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#82889e] text-xs">
              No sessions completed yet. Click "New Mock Session" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
