'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CandidateLevel, JobRole, InterviewStage } from '@/lib/types/interview';
import { TopHeader } from '@/components/dashboard/top-header';
import { ArrowRight, Users, Mic, Code2, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultStage = (searchParams.get('stage') as InterviewStage) || 'level_2_behavioral';

  const [candidateName, setCandidateName] = useState('Rahul');
  const [targetRole, setTargetRole] = useState<JobRole>('fullstack_developer');
  const [level, setLevel] = useState<CandidateLevel>('beginner');
  const [stage, setStage] = useState<InterviewStage>(defaultStage);
  const [isStarting, setIsStarting] = useState(false);

  const stagesList = [
    {
      id: 'level_2_behavioral' as InterviewStage,
      title: 'HR & Self Introduction',
      desc: 'STAR framework & conversational communication practice',
      icon: Users,
    },
    {
      id: 'level_3_tech_screen' as InterviewStage,
      title: 'Technical Fundamentals',
      desc: 'Rapid-fire core CS questions tailored to your target role',
      icon: Mic,
    },
    {
      id: 'level_4_coding' as InterviewStage,
      title: 'Live Coding Problem',
      desc: 'Algorithmic challenges in Monaco editor with test cases',
      icon: Code2,
    },
    {
      id: 'level_5_system_design' as InterviewStage,
      title: 'System Design Round',
      desc: 'Scalability, microservices, caching, and data pipelines',
      icon: CheckCircle2,
    },
  ];

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/interview/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          targetRole,
          level,
          stage,
        }),
      });

      const data = await res.json();
      if (data.success && data.session) {
        localStorage.setItem(`interview_${data.session.id}`, JSON.stringify(data.session));
        if (stage === 'level_4_coding') {
          router.push(`/interview/${data.session.id}/coding`);
        } else {
          router.push(`/interview/${data.session.id}`);
        }
      }
    } catch (err) {
      console.error(err);
      setIsStarting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafbfe]">
      <TopHeader title="New Mock Interview" />

      <div className="flex-1 p-6 sm:p-8 max-w-3xl mx-auto w-full space-y-6">
        <Link
          href="/"
          className="text-xs text-[#82889e] hover:text-[#1c1e2d] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-2xl border border-[#edf0f7] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#1c1e2d]">Setup Your Practice Session</h2>
            <p className="text-xs text-[#82889e] mt-0.5">
              Select your role, experience level, and round to tailor the AI interviewer persona.
            </p>
          </div>

          {/* Candidate Name */}
          <div>
            <label className="text-xs font-semibold text-[#1c1e2d] block mb-1.5">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full bg-[#fafbfe] border border-[#e2e7f3] rounded-xl px-3.5 py-2.5 text-xs text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5]"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          {/* Role & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#1c1e2d] block mb-1.5">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as JobRole)}
                className="w-full bg-[#fafbfe] border border-[#e2e7f3] rounded-xl px-3 py-2.5 text-xs text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5]"
              >
                <option value="fullstack_developer">Full-Stack Developer</option>
                <option value="frontend_developer">Frontend Developer (React)</option>
                <option value="backend_developer">Backend Developer (Node/Go/Python)</option>
                <option value="mobile_developer">Mobile Developer (Flutter/iOS)</option>
                <option value="devops_engineer">DevOps & Cloud Engineer</option>
                <option value="ai_ml_engineer">AI & Data Engineer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1c1e2d] block mb-1.5">Experience Level</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#fafbfe] p-1 rounded-xl border border-[#e2e7f3]">
                {(['beginner', 'intermediate', 'pro'] as CandidateLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                      level === lvl
                        ? 'bg-[#3b5bf5] text-white font-semibold shadow-sm'
                        : 'text-[#82889e] hover:text-[#1c1e2d]'
                    }`}
                  >
                    {lvl === 'beginner' ? 'Fresher' : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stage Cards */}
          <div>
            <label className="text-xs font-semibold text-[#1c1e2d] block mb-2">Select Round</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stagesList.map((s) => {
                const isSelected = stage === s.id;
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    onClick={() => setStage(s.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#3b5bf5] bg-[#f4f7fe]'
                        : 'border-[#edf0f7] bg-white hover:border-[#d9e1f5]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        isSelected ? 'bg-[#3b5bf5] text-white' : 'bg-[#f0f3fa] text-[#82889e]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1c1e2d]">{s.title}</h4>
                      <p className="text-[11px] text-[#82889e] mt-0.5 leading-snug">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleStartInterview}
            disabled={isStarting}
            className="w-full py-3 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Entering Room...</span>
              </>
            ) : (
              <>
                <span>Start Mock Session Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewInterviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#82889e]">Loading setup form...</div>}>
      <SetupForm />
    </Suspense>
  );
}
