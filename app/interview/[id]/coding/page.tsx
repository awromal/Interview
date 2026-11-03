'use client';

import React, { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CODING_CHALLENGES } from '@/lib/data/questions';
import { CodeEditor } from '@/components/interview/code-editor';
import { CodingChallenge } from '@/lib/types/interview';
import { TopHeader } from '@/components/dashboard/top-header';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CodingContent() {
  const params = useParams();
  const sessionId = (params?.id as string) || '';

  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge>(CODING_CHALLENGES[0]);
  const [hasPassed, setHasPassed] = useState(false);

  const handleExecution = (passed: boolean) => {
    if (passed) {
      setHasPassed(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafbfe]">
      <TopHeader title="Live Coding Sandbox" />

      <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f8]">
          <div className="flex items-center gap-3">
            <Link
              href={`/interview/${sessionId}`}
              className="p-2 rounded-xl bg-white hover:bg-[#f4f6fc] text-[#51576f] border border-[#e2e7f3] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#82889e]">Stage 4</span>
                {hasPassed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#10b981] border border-[#a7f3d0] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passed
                  </span>
                )}
              </div>
              <h1 className="text-base font-bold text-[#1c1e2d]">Technical Problem Solving</h1>
            </div>
          </div>

          {/* Problem Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#82889e] font-medium">Select Problem:</span>
            <select
              value={selectedChallenge.id}
              onChange={(e) => {
                const found = CODING_CHALLENGES.find((c) => c.id === e.target.value);
                if (found) {
                  setSelectedChallenge(found);
                  setHasPassed(false);
                }
              }}
              className="bg-white border border-[#e2e7f3] text-xs text-[#1c1e2d] rounded-xl px-3 py-2 focus:outline-none focus:border-[#3b5bf5]"
            >
              {CODING_CHALLENGES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.difficulty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          {/* Left: Problem Card */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#1c1e2d] mb-1.5">{selectedChallenge.title}</h2>
                <div className="text-xs text-[#51576f] leading-relaxed whitespace-pre-wrap bg-[#f8f9fd] p-3.5 rounded-xl border border-[#e8ecf6] font-mono">
                  {selectedChallenge.description}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#1c1e2d] block mb-2">Example Cases</span>
                <div className="space-y-2">
                  {selectedChallenge.testCases.map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] text-xs font-mono">
                      <div className="text-[#82889e]">Input: {tc.input}</div>
                      <div className="text-[#3b5bf5] font-semibold mt-1">Expected: {tc.expectedOutput}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] text-xs space-y-1">
                <div className="text-[#82889e]">
                  Optimal Time: <span className="text-[#1c1e2d] font-mono font-semibold">{selectedChallenge.timeComplexityOptimal}</span>
                </div>
                <div className="text-[#82889e]">
                  Optimal Space: <span className="text-[#1c1e2d] font-mono font-semibold">{selectedChallenge.spaceComplexityOptimal}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0f2f8]">
              <Link
                href={`/interview/${sessionId}`}
                className="w-full py-2.5 rounded-xl bg-[#f4f6fc] hover:bg-[#e8edf8] text-[#3b5bf5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                ← Back to Voice Interviewer
              </Link>
            </div>
          </div>

          {/* Right: Monaco Editor */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            <CodeEditor
              challenge={selectedChallenge}
              onCodeExecuted={handleExecution}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CodingInterviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#82889e]">Loading coding environment...</div>}>
      <CodingContent />
    </Suspense>
  );
}
