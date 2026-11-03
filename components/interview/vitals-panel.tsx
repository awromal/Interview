'use client';

import React, { useEffect, useState } from 'react';
import { CandidateLevel, JobRole, InterviewStage } from '@/lib/types/interview';
import { Timer, MessageSquare, Gauge, AlertCircle } from 'lucide-react';

interface VitalsPanelProps {
  level: CandidateLevel;
  role: JobRole;
  stage: InterviewStage;
  totalWords: number;
  fillerWordsCount: number;
  isActive: boolean;
}

export function VitalsPanel({
  level,
  role,
  stage,
  totalWords,
  fillerWordsCount,
  isActive,
}: VitalsPanelProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const minutesDec = Math.max(0.2, secondsElapsed / 60);
  const liveWpm = Math.round(totalWords / minutesDec);

  const roleLabels: Record<string, string> = {
    fullstack_developer: 'Full-Stack Developer',
    frontend_developer: 'Frontend Developer',
    backend_developer: 'Backend Developer',
    mobile_developer: 'Mobile Developer',
    devops_engineer: 'DevOps Engineer',
    ai_ml_engineer: 'AI & Data Engineer',
  };

  const stageLabels: Record<string, string> = {
    level_1_resume: 'Resume Check',
    level_2_behavioral: 'HR & Behavioral',
    level_3_tech_screen: 'Technical Screen',
    level_4_coding: 'Live Coding',
    level_5_system_design: 'System Design',
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#121215] border border-zinc-800 rounded-xl text-xs">
      {/* Session Details */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">
          {roleLabels[role] || 'Software Engineer'}
        </span>
        <span className="text-zinc-500">•</span>
        <span className="text-zinc-400 capitalize">
          {level === 'beginner' ? 'Fresher' : level}
        </span>
        <span className="text-zinc-500">•</span>
        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
          {stageLabels[stage] || 'Interview'}
        </span>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-5 text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-mono text-zinc-200">{formattedTime}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            <strong className="font-mono text-zinc-200">{liveWpm}</strong> WPM
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            <strong className="font-mono text-zinc-200">{totalWords}</strong> words
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            <strong className="font-mono text-zinc-200">{fillerWordsCount}</strong> fillers
          </span>
        </div>
      </div>
    </div>
  );
}
