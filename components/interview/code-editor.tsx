'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CodingChallenge } from '@/lib/types/interview';
import { Play, CheckCircle2, XCircle, Lightbulb, Terminal, Loader2 } from 'lucide-react';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  challenge: CodingChallenge;
  onCodeExecuted?: (passed: boolean, executionTimeMs: number) => void;
  onRequestHint?: () => void;
}

export function CodeEditor({ challenge, onCodeExecuted, onRequestHint }: CodeEditorProps) {
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [code, setCode] = useState<string>(challenge.starterCode.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'console'>('tests');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState<number>(0);

  const handleLanguageChange = (newLang: 'javascript' | 'typescript' | 'python') => {
    setLanguage(newLang);
    setCode(challenge.starterCode[newLang] || '');
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          challengeId: challenge.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResults(data.testResults || []);
        setConsoleLogs(data.logs || []);
        if (onCodeExecuted) {
          onCodeExecuted(data.passed, data.executionTimeMs);
        }
      } else {
        setConsoleLogs([`Error: ${data.error || 'Failed to run code'}`]);
        setActiveTab('console');
      }
    } catch (err: any) {
      setConsoleLogs([`Network error: ${err.message}`]);
      setActiveTab('console');
    } finally {
      setIsRunning(false);
    }
  };

  const revealNextHint = () => {
    if (revealedHints < challenge.hints.length) {
      setRevealedHints((prev) => prev + 1);
      if (onRequestHint) onRequestHint();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121215] border border-zinc-800 rounded-xl overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#18181b] border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">
            {challenge.title}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {challenge.difficulty}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="bg-[#121215] border border-zinc-700 text-xs text-zinc-300 rounded px-2 py-1 focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-semibold px-3 py-1 rounded transition-colors cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Run Tests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="h-[360px] w-full border-b border-zinc-800">
        <Editor
          height="100%"
          language={language === 'python' ? 'python' : 'typescript'}
          value={code}
          onChange={(val) => setCode(val || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: 'monospace',
          }}
        />
      </div>

      {/* Test Output / Console */}
      <div className="flex-1 flex flex-col bg-[#141417] text-xs">
        <div className="flex items-center justify-between px-3 border-b border-zinc-800 bg-[#121215]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('tests')}
              className={`py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'tests'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Test Cases {testResults.length > 0 && `(${testResults.filter(t => t.passed).length}/${testResults.length})`}
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`py-2 font-medium border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'console'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Terminal className="w-3 h-3" /> Console
            </button>
          </div>

          {challenge.hints && challenge.hints.length > 0 && (
            <button
              onClick={revealNextHint}
              disabled={revealedHints >= challenge.hints.length}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 py-1 cursor-pointer disabled:opacity-40"
            >
              <Lightbulb className="w-3 h-3" />
              {revealedHints >= challenge.hints.length
                ? 'All Hints Shown'
                : `Need a Hint? (${revealedHints}/${challenge.hints.length})`}
            </button>
          )}
        </div>

        <div className="p-3 overflow-y-auto max-h-[160px]">
          {revealedHints > 0 && (
            <div className="mb-2 space-y-1">
              {challenge.hints.slice(0, revealedHints).map((hint, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]"
                >
                  <strong>Hint {idx + 1}:</strong> {hint}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tests' ? (
            testResults.length > 0 ? (
              <div className="space-y-1.5">
                {testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded border border-zinc-800 bg-[#18181b] flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      {t.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span className="font-mono text-zinc-300">{t.input}</span>
                    </div>
                    <span className={t.passed ? 'text-white font-medium' : 'text-zinc-400 font-medium'}>
                      {t.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-center py-3">Click "Run Tests" to test your solution.</p>
            )
          ) : (
            <div className="font-mono text-[11px] text-zinc-300 whitespace-pre-wrap">
              {consoleLogs.length > 0 ? (
                consoleLogs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <span className="text-zinc-500">No console logs yet.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
