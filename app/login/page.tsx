'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { JobRole, CandidateLevel } from '@/lib/types/interview';
import {
  Sparkles,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Mic,
  FileText,
  Code2,
  Award,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState<JobRole>('fullstack_developer');
  const [level, setLevel] = useState<CandidateLevel>('beginner');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    login({
      name: name.trim(),
      email: email.trim(),
      targetRole,
      level,
    });
  };

  const handleQuickDemo = (demoName: string, demoEmail: string, demoRole: JobRole, demoLevel: CandidateLevel) => {
    setName(demoName);
    setEmail(demoEmail);
    setTargetRole(demoRole);
    setLevel(demoLevel);
    login({
      name: demoName,
      email: demoEmail,
      targetRole: demoRole,
      level: demoLevel,
    });
  };

  const roleOptions: { value: JobRole; label: string }[] = [
    { value: 'fullstack_developer', label: 'Full-Stack Developer (React & Node)' },
    { value: 'frontend_developer', label: 'Frontend Engineer (React / Next.js)' },
    { value: 'backend_developer', label: 'Backend Engineer (Node / Python / Go)' },
    { value: 'mobile_developer', label: 'Mobile Developer (Flutter / iOS)' },
    { value: 'devops_engineer', label: 'DevOps & Cloud Engineer' },
    { value: 'ai_ml_engineer', label: 'AI & Machine Learning Engineer' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 bg-gradient-to-br from-[#f8fafd] via-[#f2f5fc] to-[#eff3fc] min-h-full">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#e8ecf4] shadow-[0_20px_60px_rgba(28,30,45,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form Section (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Logo Badge */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#3b5bf5] flex items-center justify-center shadow-md shadow-blue-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#1c1e2d]">
                Interview<span className="text-[#3b5bf5]">AI</span>
              </span>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1e2d]">
                Candidate Sign In
              </h2>
              <p className="text-xs sm:text-sm text-[#82889e] mt-1.5 leading-relaxed">
                Enter your name and target role to begin your personalized AI mock interview session. Your session persists across page refreshes.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-[#1c1e2d] block mb-1.5">
                  Full Name <span className="text-[#ff4d4f]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#82889e] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#fafbfe] border border-[#e2e7f3] rounded-xl text-xs sm:text-sm text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5] transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[#1c1e2d] block mb-1.5">
                  Email Address <span className="text-[#ff4d4f]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#82889e] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arun@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#fafbfe] border border-[#e2e7f3] rounded-xl text-xs sm:text-sm text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5] transition-colors"
                  />
                </div>
              </div>

              {/* Role & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#1c1e2d] block mb-1.5">
                    Target Role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#82889e] absolute left-3.5 top-3 pointer-events-none" />
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value as JobRole)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#fafbfe] border border-[#e2e7f3] rounded-xl text-xs text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5] transition-colors appearance-none cursor-pointer"
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1c1e2d] block mb-1.5">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#fafbfe] p-1 rounded-xl border border-[#e2e7f3]">
                    {(['beginner', 'intermediate', 'pro'] as CandidateLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={`py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                          level === lvl
                            ? 'bg-[#3b5bf5] text-white shadow-xs'
                            : 'text-[#82889e] hover:text-[#1c1e2d]'
                        }`}
                      >
                        {lvl === 'beginner' ? 'Fresher' : lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !email.trim()}
                className="w-full py-3 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
              >
                <span>Enter Dashboard & Start Interview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-[#f0f2f8]">
              <span className="text-[11px] text-[#82889e] block mb-2 font-medium">
                ⚡ Quick demo accounts (one-click login):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemo('Arun Kumar', 'arun.kumar@gmail.com', 'fullstack_developer', 'beginner')
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#f4f6fc] hover:bg-[#ebf0fe] border border-[#e2e7f3] text-[11px] font-medium text-[#1c1e2d] transition-colors cursor-pointer"
                >
                  👨‍💻 Arun (Full-Stack Fresher)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemo('Priya Nair', 'priya.nair@outlook.com', 'frontend_developer', 'intermediate')
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#f4f6fc] hover:bg-[#ebf0fe] border border-[#e2e7f3] text-[11px] font-medium text-[#1c1e2d] transition-colors cursor-pointer"
                >
                  👩‍💻 Priya (Frontend React)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemo('Deepak V', 'deepak.v@example.com', 'backend_developer', 'pro')
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#f4f6fc] hover:bg-[#ebf0fe] border border-[#e2e7f3] text-[11px] font-medium text-[#1c1e2d] transition-colors cursor-pointer"
                >
                  🚀 Deepak (Backend Pro)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-[11px] text-[#82889e]">
            🔒 Your session is securely stored in your browser and will not log out on refresh or back navigation.
          </div>
        </div>

        {/* Right Feature Showcase Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#3b5bf5] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block mb-2">
              Next-Gen Tech Interview Suite
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              Prepare from Fresher to Pro with AI Intelligence
            </h3>
            <p className="text-xs text-blue-100 mt-2 leading-relaxed">
              Real-time conversational voice interviewer, instant resume scoring, and live algorithmic sandboxes tailored for top product companies.
            </p>

            {/* Feature List */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Voice Conversational AI</h4>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Speak out loud to the interviewer. AI listens, reacts to your specific answers, and asks dynamic follow-ups.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">ATS Resume Scanner & Custom Questions</h4>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Audit your resume score, find missing keywords, and practice live mock questions drawn straight from your resume.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Monaco Live Coding Sandbox</h4>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    Solve algorithmic challenges in JS, TS, and Python with live unit test runners and complexity ratings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">In-Depth Performance Scorecard</h4>
                  <p className="text-[11px] text-blue-100 mt-0.5">
                    STAR framework scoring, communication analysis, filler-word tracking, and targeted advice.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-white/20 flex items-center justify-between text-[11px] text-blue-200">
            <span>Powered by Gemini & Modern Web Speech</span>
            <span className="font-semibold text-white">Version 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
