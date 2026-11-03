'use client';

import React, { useState, useRef } from 'react';
import { ATSGauge } from '@/components/resume/ats-gauge';
import { ATSAnalysisResult, JobRole } from '@/lib/types/interview';
import { TopHeader } from '@/components/dashboard/top-header';
import { UploadCloud, FileText, Loader2, ArrowLeft, X, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_SAMPLE_RESUME = (name = 'ARUN KUMAR', email = 'candidate@example.com') => `${name.toUpperCase()}
Email: ${email} | GitHub: github.com/candidate-dev | LinkedIn: linkedin.com/in/candidate
Summary:
Recent Computer Science graduate passionate about full-stack web development and scalable distributed systems.
Hands-on experience building web applications using React, Next.js, Node.js, and PostgreSQL.

SKILLS:
- Languages: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3, SQL
- Frameworks & Libraries: React.js, Next.js, Express.js, Tailwind CSS, Redux Toolkit
- Databases & Tools: PostgreSQL, MongoDB, Git, GitHub, Docker, Postman, Vercel

PROJECTS:
1. DevCollab — Developer Networking Platform (React, Node.js, PostgreSQL)
- Developed a fullstack collaborative platform allowing developers to share code snippets and project updates.
- Designed RESTful API endpoints in Node.js and Express, handling user authentication with JWT.
- Integrated PostgreSQL with Prisma ORM for efficient relational data modeling.

2. E-Commerce Cart & Checkout System (Next.js, TypeScript, Tailwind)
- Implemented responsive storefront with client-side state management and server-side rendering for optimal SEO.
- Built reusable UI components and integrated Stripe payment simulation.

EDUCATION:
Bachelor of Technology in Computer Science & Engineering
CGPA: 8.6 / 10.0`;

export default function ResumeCheckPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(DEFAULT_SAMPLE_RESUME());
  const [targetRole, setTargetRole] = useState<JobRole>('fullstack_developer');
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('interview_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.name) {
            setResumeText(DEFAULT_SAMPLE_RESUME(u.name, u.email || 'candidate@example.com'));
          }
          if (u.targetRole) {
            setTargetRole(u.targetRole);
          }
        } catch {}
      }
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let res: Response;

      if (activeTab === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('targetRole', targetRole);
        formData.append('jobDescription', jobDescription);

        res = await fetch('/api/resume', {
          method: 'POST',
          body: formData,
        });
      } else {
        if (!resumeText.trim()) {
          setErrorMsg('Please enter or paste your resume text.');
          setIsLoading(false);
          return;
        }

        res = await fetch('/api/resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText,
            targetRole,
            jobDescription,
          }),
        });
      }

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
      } else {
        setErrorMsg(data.error || 'Failed to analyze resume');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafbfe]">
      <TopHeader title="Resume & ATS Scanner" />

      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
        {/* Back Link */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f2f8]">
          <Link
            href="/"
            className="text-xs text-[#82889e] hover:text-[#1c1e2d] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs text-[#82889e]">Stage 1 of 5</span>
        </div>

        {!result ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Area: Upload / Text Input */}
            <div className="md:col-span-8 space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#1c1e2d]">
                    Add Candidate Resume
                  </h2>

                  {/* Switcher Tab */}
                  <div className="flex items-center gap-1 bg-[#f4f6fc] p-1 rounded-xl border border-[#e8ecf6]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'upload'
                          ? 'bg-white text-[#3b5bf5] shadow-sm'
                          : 'text-[#82889e] hover:text-[#1c1e2d]'
                      }`}
                    >
                      Drag & Drop File
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('text')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'text'
                          ? 'bg-white text-[#3b5bf5] shadow-sm'
                          : 'text-[#82889e] hover:text-[#1c1e2d]'
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>
                </div>

                {activeTab === 'upload' ? (
                  <div>
                    {/* Drag and Drop Box */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                        isDragging
                          ? 'border-[#3b5bf5] bg-[#f4f7fe]'
                          : selectedFile
                          ? 'border-[#10b981] bg-[#ecfdf5]/40'
                          : 'border-[#dce4f9] hover:border-[#3b5bf5] bg-[#fafbfe]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                      />

                      <div className="w-12 h-12 rounded-2xl bg-[#f4f7fe] text-[#3b5bf5] flex items-center justify-center shadow-sm">
                        <UploadCloud className="w-6 h-6" />
                      </div>

                      {selectedFile ? (
                        <div>
                          <span className="text-xs font-bold text-[#1c1e2d] block">
                            {selectedFile.name}
                          </span>
                          <span className="text-[11px] text-[#82889e]">
                            {(selectedFile.size / 1024).toFixed(1)} KB • Ready to analyze
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-[#1c1e2d]">
                            Drag & drop your resume here, or <span className="text-[#3b5bf5] underline">browse files</span>
                          </p>
                          <p className="text-[11px] text-[#82889e] mt-1">
                            Supports PDF, DOCX, or TXT (Max 10MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedFile && (
                      <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-[#f8f9fd] border border-[#e8ecf6] text-xs">
                        <div className="flex items-center gap-2 text-[#1c1e2d] font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                          <span>{selectedFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="text-[#ff4d4f] hover:text-[#d93025] p-1 cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="text-[#82889e]">Plain Text Resume:</span>
                      <button
                        type="button"
                        onClick={() => setResumeText(DEFAULT_SAMPLE_RESUME())}
                        className="text-[#3b5bf5] hover:underline font-semibold cursor-pointer"
                      >
                        Load Sample Fresher Resume
                      </button>
                    </div>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={12}
                      className="w-full bg-[#fafbfe] border border-[#e2e7f3] rounded-xl p-3.5 text-xs font-mono text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5]"
                      placeholder="Paste resume content here..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Area: Job Config & Submit */}
            <div className="md:col-span-4 space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1c1e2d] block mb-1.5">
                    Target Job Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as JobRole)}
                    className="w-full bg-[#fafbfe] border border-[#e2e7f3] text-xs text-[#1c1e2d] rounded-xl p-2.5 focus:outline-none focus:border-[#3b5bf5]"
                  >
                    <option value="fullstack_developer">Full-Stack Developer</option>
                    <option value="frontend_developer">Frontend Developer (React)</option>
                    <option value="backend_developer">Backend Developer (Node/SQL)</option>
                    <option value="mobile_developer">Mobile Developer (Flutter/iOS)</option>
                    <option value="devops_engineer">DevOps & Cloud Engineer</option>
                    <option value="ai_ml_engineer">AI & Data Engineer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1c1e2d] block mb-1.5">
                    Job Description <span className="text-[#82889e] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-[#fafbfe] border border-[#e2e7f3] rounded-xl p-2.5 text-xs text-[#1c1e2d] placeholder-[#82889e] focus:outline-none focus:border-[#3b5bf5]"
                    placeholder="Paste job posting details..."
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-[#fff2f2] border border-[#ffc2c2] text-[#d93025] text-xs">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning ATS Score...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Scan Resume & Get Questions</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informational Tip */}
              <div className="p-4 rounded-xl bg-[#f4f7fe] border border-[#dce4f9] text-xs text-[#51576f] space-y-1">
                <span className="font-bold text-[#3b5bf5] block">Why this step matters:</span>
                <p>The system audits your resume formatting, keywords, and action verbs, and generates real interview questions based on your projects!</p>
              </div>
            </div>
          </div>
        ) : (
          <ATSGauge
            analysis={result}
            onReset={() => {
              setResult(null);
              setSelectedFile(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
