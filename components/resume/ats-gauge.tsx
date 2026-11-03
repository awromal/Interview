'use client';

import React, { useState } from 'react';
import { ATSAnalysisResult, GeneratedResumeQuestion } from '@/lib/types/interview';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Mic,
  MicOff,
  Send,
  Sparkles,
  BookOpen,
  Check,
  X,
  Loader2,
  Award,
} from 'lucide-react';
import Link from 'next/link';

interface ATSGaugeProps {
  analysis: ATSAnalysisResult;
  onReset?: () => void;
}

export function ATSGauge({ analysis, onReset }: ATSGaugeProps) {
  const {
    atsScore,
    formattingScore,
    metricsScore,
    actionVerbsScore,
    matchedKeywords,
    missingKeywords,
    suggestedActionItems,
    resumeSectionsFound,
    customInterviewSyllabus,
    generatedQuestions,
    experienceLevelEstimate,
  } = analysis;

  // Active question for live practice
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const activeQuestion: GeneratedResumeQuestion = generatedQuestions[activeQuestionIdx] || generatedQuestions[0];

  // Speech Recognition
  const toggleRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer below.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer(transcript);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      setIsRecording(true);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluatingAnswer(true);
    try {
      const res = await fetch('/api/resume/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: activeQuestion.question,
          candidateAnswer: userAnswer,
          context: activeQuestion.context,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluationResult(data.evaluation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Score & Summary */}
      <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Donut Gauge */}
          <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#edf0f7]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke="#3b5bf5"
                strokeDasharray={`${atsScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-mono font-bold text-[#1c1e2d]">{atsScore}</span>
              <span className="text-[9px] text-[#82889e]">/100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#3b5bf5]">
                {atsScore >= 75 ? 'Strong ATS Readiness' : 'Needs Optimization'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#f4f7fe] text-[#3b5bf5] border border-[#dce4f9] font-medium capitalize">
                Est. Level: {experienceLevelEstimate}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#1c1e2d]">Resume Analysis & Screening Complete</h3>
            <p className="text-xs text-[#82889e] mt-0.5">
              Review your ATS audit below and answer the mock questions generated specifically from your resume.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-[#f8f9fd] border border-[#e2e7f3] hover:bg-[#f0f3fa] text-[#51576f] text-xs font-medium cursor-pointer"
            >
              Upload Another
            </button>
          )}
          <Link
            href="/interview/new"
            className="px-4 py-2.5 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Full Mock Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#edf0f7] shadow-sm">
          <span className="text-[11px] text-[#82889e] block">Structure & Formatting</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-bold text-[#1c1e2d]">{formattingScore}%</span>
          </div>
          <p className="text-[11px] text-[#82889e] mt-0.5">Standard sections detected</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#edf0f7] shadow-sm">
          <span className="text-[11px] text-[#82889e] block">Quantifiable Metrics</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-bold text-[#1c1e2d]">{metricsScore}%</span>
          </div>
          <p className="text-[11px] text-[#82889e] mt-0.5">Numbers, percentages & data</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#edf0f7] shadow-sm">
          <span className="text-[11px] text-[#82889e] block">Action Verbs & Impact</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-mono font-bold text-[#1c1e2d]">{actionVerbsScore}%</span>
          </div>
          <p className="text-[11px] text-[#82889e] mt-0.5">Strong engineering verbs</p>
        </div>
      </div>

      {/* Section Check Audit */}
      <div className="p-5 rounded-2xl bg-white border border-[#edf0f7] shadow-sm">
        <h4 className="text-xs font-bold text-[#1c1e2d] uppercase tracking-wider mb-3">
          Resume Sections ATS Audit
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {resumeSectionsFound.map((sec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                {sec.status === 'present' ? (
                  <span className="w-5 h-5 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-[#fff2f2] text-[#ff4d4f] flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <div>
                  <span className="font-semibold text-[#1c1e2d]">{sec.section}</span>
                  <span className="text-[11px] text-[#82889e] block">{sec.tip}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                sec.status === 'present' ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#fff2f2] text-[#ff4d4f]'
              }`}>
                {sec.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched */}
        <div className="p-5 rounded-2xl bg-white border border-[#edf0f7] shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#10b981]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Matched Technical Keywords ({matchedKeywords.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] font-mono font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing */}
        <div className="p-5 rounded-2xl bg-white border border-[#edf0f7] shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#f59e0b]">
            <AlertTriangle className="w-4 h-4" />
            <span>Recommended Keywords to Add ({missingKeywords.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#fffbeb] border border-[#fde68a] text-[#92400e] font-mono font-medium"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* LIVE MOCK INTERVIEW QUESTIONS GENERATED DIRECTLY FROM RESUME */}
      <div className="p-6 rounded-2xl bg-white border-2 border-[#3b5bf5]/20 shadow-md shadow-blue-500/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#3b5bf5] text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1e2d]">
                Live Questions from Your Resume
              </h4>
              <p className="text-xs text-[#82889e]">
                Practice answering questions recruiters will ask about your specific projects.
              </p>
            </div>
          </div>

          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f4f7fe] text-[#3b5bf5] font-semibold border border-[#dce4f9]">
            Interactive Practice
          </span>
        </div>

        {/* Question Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-[#f0f2f8] pb-2">
          {generatedQuestions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setActiveQuestionIdx(idx);
                setUserAnswer('');
                setEvaluationResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeQuestionIdx === idx
                  ? 'bg-[#3b5bf5] text-white shadow-sm'
                  : 'bg-[#f4f6fc] text-[#82889e] hover:text-[#1c1e2d]'
              }`}
            >
              Question {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Question Box */}
        <div className="p-4 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#82889e]">
            <span className="font-semibold text-[#3b5bf5]">{activeQuestion.context}</span>
            <span className="capitalize">{activeQuestion.difficulty} Level</span>
          </div>

          <p className="text-sm font-bold text-[#1c1e2d] leading-relaxed">
            "{activeQuestion.question}"
          </p>

          {/* User Live Answer Box */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-[#1c1e2d] block">
              Your Answer (Speak via mic or type):
            </label>
            <div className="relative">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={3}
                placeholder={isRecording ? 'Listening... please speak your response now.' : 'Speak using the microphone or type your answer here...'}
                className="w-full bg-white border border-[#e2e7f3] rounded-xl p-3 text-xs text-[#1c1e2d] placeholder-[#82889e] focus:outline-none focus:border-[#3b5bf5]"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-[#ff4d4f] text-white border-[#ff4d4f] animate-pulse'
                    : 'bg-white text-[#51576f] border-[#e2e7f3] hover:bg-[#f4f6fc]'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Stop Recording' : 'Speak Answer'}</span>
              </button>

              <button
                type="button"
                onClick={handleAnswerSubmit}
                disabled={!userAnswer.trim() || isEvaluatingAnswer}
                className="px-4 py-1.5 rounded-lg bg-[#3b5bf5] hover:bg-[#2e4de6] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isEvaluatingAnswer ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Evaluation Card */}
          {evaluationResult && (
            <div className="mt-4 p-4 rounded-xl bg-white border border-[#dce4f9] shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#f0f2f8] pb-2">
                <span className="font-bold text-[#1c1e2d]">Answer Feedback</span>
                <span className="font-mono font-bold text-[#3b5bf5] text-sm">
                  Score: {evaluationResult.score}/100
                </span>
              </div>
              <p className="text-[#51576f] leading-relaxed">
                {evaluationResult.feedback}
              </p>

              {evaluationResult.strengths && (
                <div className="pt-1">
                  <span className="font-semibold text-[#10b981] block mb-0.5">What was good:</span>
                  <ul className="list-disc list-inside text-[#51576f] space-y-0.5">
                    {evaluationResult.strengths.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluationResult.improvements && (
                <div className="pt-1">
                  <span className="font-semibold text-[#f59e0b] block mb-0.5">How to elevate this answer:</span>
                  <ul className="list-disc list-inside text-[#51576f] space-y-0.5">
                    {evaluationResult.improvements.map((imp: string, idx: number) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Action Items */}
      <div className="p-5 rounded-2xl bg-white border border-[#edf0f7] shadow-sm text-xs text-[#51576f]">
        <h4 className="font-bold text-[#1c1e2d] mb-2">Resume Optimization Checklist</h4>
        <ul className="space-y-1 list-disc list-inside">
          {suggestedActionItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
