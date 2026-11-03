'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { InterviewSession } from '@/lib/types/interview';
import { TopHeader } from '@/components/dashboard/top-header';
import { CheckCircle2, AlertTriangle, ArrowRight, Printer, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';

function ReportContent() {
  const params = useParams();
  const sessionId = (params?.id as string) || '';

  const [session, setSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const stored = localStorage.getItem(`interview_${sessionId}`);
    if (stored) {
      try {
        const parsed: InterviewSession = JSON.parse(stored);
        setSession(parsed);
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
  }, [sessionId]);

  if (!session || !session.scorecard) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-[#1c1e2d] mb-1">No Scorecard Available</h2>
        <p className="text-xs text-[#82889e] mb-4">Complete a mock interview session to view your evaluation.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3b5bf5] text-white text-xs font-semibold"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const { scorecard } = session;
  const { breakdown, speechMetrics, strengths, areasOfImprovement, actionPlan, detailedQuestionEvaluations } = scorecard;

  const categories = [
    { label: 'Technical Accuracy', score: breakdown.technicalAccuracy, color: '#3b5bf5' },
    { label: 'Communication Clarity', score: breakdown.communicationClarity, color: '#10b981' },
    { label: 'Confidence & Pacing', score: breakdown.confidenceAndPacing, color: '#38bdf8' },
    { label: 'STAR Method Alignment', score: breakdown.starMethodAlignment, color: '#f59e0b' },
    { label: 'Problem-Solving Approach', score: breakdown.problemSolvingApproach, color: '#ff6b6b' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafbfe]">
      <TopHeader title="Interview Scorecard & Report" />

      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full text-xs">
        {/* Top Summary Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#edf0f7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Score Ring */}
            <div className="w-20 h-20 rounded-2xl bg-[#f4f7fe] border border-[#dce4f9] flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-extrabold text-[#3b5bf5]">{scorecard.overallScore}</span>
              <span className="text-[10px] text-[#82889e] uppercase font-bold">/ 100</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#10b981] border border-[#a7f3d0] font-bold">
                  Evaluation Finished
                </span>
                <span className="text-xs text-[#82889e] capitalize">
                  {session.targetRole.replace('_', ' ')} • {session.level} Level
                </span>
              </div>
              <h1 className="text-lg font-bold text-[#1c1e2d]">
                Candidate Performance Scorecard
              </h1>
              <p className="text-xs text-[#82889e] mt-0.5">
                Pacing: <strong>{speechMetrics.wordsPerMinute} WPM</strong> • Fillers Detected: <strong>{speechMetrics.fillerWordsCount}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-[#f8f9fd] border border-[#e2e7f3] hover:bg-[#f0f3fa] text-[#51576f] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm">
          <h3 className="text-xs font-bold text-[#1c1e2d] uppercase tracking-wider mb-4">
            Performance Breakdown
          </h3>
          <div className="space-y-3.5">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#1c1e2d]">{cat.label}</span>
                  <span className="font-mono font-bold text-[#3b5bf5]">{cat.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#edf0f7] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#10b981] mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Demonstrated Strengths</span>
            </div>
            <ul className="space-y-2 text-xs text-[#51576f] list-disc list-inside">
              {strengths.map((s, idx) => (
                <li key={idx} className="leading-relaxed">{s}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-[#ff6b6b] mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>Areas for Improvement</span>
            </div>
            <ul className="space-y-2 text-xs text-[#51576f] list-disc list-inside">
              {areasOfImprovement.map((area, idx) => (
                <li key={idx} className="leading-relaxed">{area}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Plan */}
        <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1c1e2d] mb-4">
            <BookOpen className="w-4 h-4 text-[#3b5bf5]" />
            <span>Recommended Next Steps</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {actionPlan.map((action) => (
              <div key={action.step} className="p-4 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] text-xs">
                <span className="font-mono text-[#3b5bf5] font-bold text-[10px] block mb-1">
                  STEP {action.step} • {action.topicToStudy}
                </span>
                <p className="text-[#51576f] leading-snug">{action.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions Deep Dive */}
        {detailedQuestionEvaluations && detailedQuestionEvaluations.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#1c1e2d] uppercase tracking-wider mb-2">
              Question Evaluation Detail
            </h3>
            <div className="space-y-3">
              {detailedQuestionEvaluations.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] text-xs space-y-1.5">
                  <div className="font-bold text-[#1c1e2d]">Q: {q.questionText}</div>
                  <div className="text-[#51576f]">
                    <strong className="text-[#1c1e2d]">Your Answer:</strong> {q.candidateAnswer}
                  </div>
                  <div className="text-[#3b5bf5]">
                    <strong className="text-[#1c1e2d]">Feedback:</strong> {q.feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#82889e]">Loading scorecard...</div>}>
      <ReportContent />
    </Suspense>
  );
}
