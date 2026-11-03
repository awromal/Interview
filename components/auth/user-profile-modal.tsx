'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, JobRole } from '@/lib/types/interview';
import { User, Mail, Briefcase, X, Check, LogOut } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: UserProfile | null) => void;
}

export function UserProfileModal({ isOpen, onClose, onProfileUpdated }: UserProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState<JobRole>('fullstack_developer');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('interview_user');
      if (stored) {
        try {
          const parsed: UserProfile = JSON.parse(stored);
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          setTargetRole(parsed.targetRole || 'fullstack_developer');
        } catch {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Please enter both your name and email address.');
      return;
    }

    const newProfile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      targetRole,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('interview_user', JSON.stringify(newProfile));
    setIsSaved(true);
    onProfileUpdated(newProfile);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleLogout = () => {
    localStorage.removeItem('interview_user');
    setName('');
    setEmail('');
    onProfileUpdated(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[#e8ecf4] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#82889e] hover:text-[#1c1e2d] p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#3b5bf5] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1c1e2d]">Candidate Profile / Login</h3>
            <p className="text-xs text-[#82889e]">Enter your details for personalized mock interviews</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1c1e2d] block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#82889e] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arun Kumar"
                className="w-full pl-9 pr-3 py-2.5 bg-[#fafbfe] border border-[#e2e7f3] rounded-xl text-xs text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1c1e2d] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#82889e] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arun@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#fafbfe] border border-[#e2e7f3] rounded-xl text-xs text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1c1e2d] block mb-1">Target Role</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-[#82889e] absolute left-3 top-3" />
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as JobRole)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#fafbfe] border border-[#e2e7f3] rounded-xl text-xs text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5]"
              >
                <option value="fullstack_developer">Full-Stack Developer</option>
                <option value="frontend_developer">Frontend Developer (React)</option>
                <option value="backend_developer">Backend Developer (Node/SQL)</option>
                <option value="mobile_developer">Mobile Developer (Flutter/iOS)</option>
                <option value="devops_engineer">DevOps & Cloud Engineer</option>
                <option value="ai_ml_engineer">AI & Data Engineer</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {localStorage.getItem('interview_user') && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-xl border border-[#ff4d4f]/30 text-[#ff4d4f] hover:bg-[#fff2f2] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <span>Save & Continue</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
