'use client';

import React from 'react';
import { TranscriptMessage } from '@/lib/types/interview';
import { Volume2 } from 'lucide-react';

interface ChatTranscriptProps {
  transcript: TranscriptMessage[];
  interviewerName?: string;
  onSpeakText?: (text: string) => void;
}

export function ChatTranscript({ transcript, interviewerName = 'Interviewer', onSpeakText }: ChatTranscriptProps) {
  return (
    <div className="flex flex-col gap-3.5 overflow-y-auto pr-1 max-h-[480px]">
      {transcript.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 text-xs">
          <p>The interview has started. The conversation transcript will appear here.</p>
        </div>
      ) : (
        transcript.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-zinc-500 px-1">
                <span className="font-medium text-zinc-300">
                  {isAi ? interviewerName : 'You'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed border ${
                  isAi
                    ? 'bg-[#18181b] border-zinc-800 text-zinc-200'
                    : 'bg-zinc-800 border-zinc-700 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.fillerWordsDetected && msg.fillerWordsDetected.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-700/60 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-zinc-400">Noted fillers:</span>
                    {msg.fillerWordsDetected.map((fw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-300 px-1.5 py-0.2 rounded"
                      >
                        "{fw}"
                      </span>
                    ))}
                  </div>
                )}

                {isAi && onSpeakText && (
                  <button
                    onClick={() => onSpeakText(msg.text)}
                    className="mt-2 text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" /> Replay Voice
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
