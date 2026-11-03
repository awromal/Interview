'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InterviewSession, TranscriptMessage } from '@/lib/types/interview';
import { AudioVisualizer } from '@/components/interview/audio-visualizer';
import { ChatTranscript } from '@/components/interview/chat-transcript';
import { VitalsPanel } from '@/components/interview/vitals-panel';
import { TopHeader } from '@/components/dashboard/top-header';
import {
  Mic,
  MicOff,
  Send,
  Award,
  Code2,
  Loader2,
  ArrowLeft,
  Volume2,
  VolumeX,
  AlertCircle,
  Check,
} from 'lucide-react';
import Link from 'next/link';

function InterviewRoomContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.id as string) || '';

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [candidateInput, setCandidateInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'en-US' | 'en-GB' | 'ml-IN'>('en-IN');

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptAccumulatorRef = useRef<string>('');

  // Prime speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Load session from localStorage or initialize
  useEffect(() => {
    if (!sessionId) return;

    let candidateName = 'Candidate';
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('interview_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.name) candidateName = u.name;
        } catch {}
      }
    }

    const stored = localStorage.getItem(`interview_${sessionId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (candidateName !== 'Candidate' && (!parsed.candidateName || parsed.candidateName === 'Candidate')) {
          parsed.candidateName = candidateName;
          localStorage.setItem(`interview_${sessionId}`, JSON.stringify(parsed));
        }
        setSession(parsed);
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    } else {
      const fallback: InterviewSession = {
        id: sessionId,
        candidateName,
        targetRole: 'fullstack_developer',
        level: 'beginner',
        stage: 'level_2_behavioral',
        createdAt: new Date().toISOString(),
        status: 'in_progress',
        currentQuestionIndex: 0,
        questions: [],
        transcript: [
          {
            id: 'msg-0',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Hello ${candidateName}! Welcome to your mock interview session. I'm your interviewer today. Let's begin: Can you tell me about yourself, your background in software engineering, and what projects you've built recently?`,
          },
        ],
      };
      setSession(fallback);
      localStorage.setItem(`interview_${sessionId}`, JSON.stringify(fallback));
    }
  }, [sessionId]);

  // Clean up recording state on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Text-To-Speech function
  const speakText = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
        voices.find((v) => v.lang.startsWith('en')) || null;
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      setIsAiSpeaking(false);
    }
  };

  // Safe teardown of audio and speech recognition
  const stopRecordingCleanup = () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
  };

  // Start voice recording and Web Speech recognition
  const startRecording = async () => {
    setMicError(null);
    transcriptAccumulatorRef.current = '';
    setCandidateInput('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);
      isRecordingRef.current = true;

      // Initialize Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = selectedLanguage;
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: any) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              fullTranscript += event.results[i][0].transcript + ' ';
            }
            const clean = fullTranscript.trim();
            if (clean) {
              transcriptAccumulatorRef.current = clean;
              setCandidateInput(clean);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition warning:', event.error);
            if (event.error === 'not-allowed') {
              setMicError('Microphone permission was denied. Please allow microphone access in your browser settings.');
              stopRecordingCleanup();
            } else if (event.error === 'no-speech') {
              // Benign timeout while candidate thinks; do not abort
            }
          };

          recognition.onend = () => {
            // Restart if user is still actively recording
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (sttErr) {
          console.warn('Web Speech API initialization warning:', sttErr);
        }
      }

      // Also record raw audio as backup
      try {
        audioChunksRef.current = [];
        const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.start(250);
        mediaRecorderRef.current = mediaRecorder;
      } catch (recErr) {
        console.warn('MediaRecorder init error:', recErr);
      }
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMicError('Could not access microphone. Please check your browser microphone permissions.');
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  // Stop recording and send the user's actual spoken response
  const stopRecordingAndSend = async () => {
    stopRecordingCleanup();

    // Check if we captured text via Web Speech
    const capturedText = (transcriptAccumulatorRef.current || candidateInput).trim();

    if (capturedText) {
      // User spoke and text was transcribed - send exactly what was said
      handleSendMessage(capturedText);
      return;
    }

    // If live Web Speech did not catch words but we have audio, attempt cloud transcription
    if (audioChunksRef.current.length > 0) {
      setIsTranscribingAudio(true);
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'candidate_voice.webm');

        const res = await fetch('/api/interview/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.transcript && data.transcript.trim()) {
          handleSendMessage(data.transcript.trim());
          return;
        } else {
          // Never send dummy text! Give honest guidance
          setMicError('സംസാരം തിരിച്ചറിഞ്ഞിട്ടില്ല (No speech detected). ദയവായി വീണ്ടും സംസാരിക്കുക, അല്ലെങ്കിൽ താഴെ ടൈപ്പ് ചെയ്യുക.');
        }
      } catch (err) {
        console.error('Audio transcription failed:', err);
        setMicError('വോയിസ് പ്രോസസ്സ് ചെയ്യാൻ സാധിച്ചില്ല. ദയവായി നിങ്ങളുടെ മറുപടി താഴെയുള്ള ബോക്സിൽ ടൈപ്പ് ചെയ്യുക.');
      } finally {
        setIsTranscribingAudio(false);
      }
    } else {
      setMicError('സംസാരം തിരിച്ചറിഞ്ഞിട്ടില്ല. ദയവായി "Speak Answer" ക്ലിക്ക് ചെയ്ത് സംസാരിക്കുക.');
    }
  };

  // Switch from live recording to text editing so user can refine before sending
  const handleReviewAndEdit = () => {
    stopRecordingCleanup();
    // candidateInput already holds the transcribed words, so user can edit in text input
  };

  const cancelRecording = () => {
    stopRecordingCleanup();
    setCandidateInput('');
    transcriptAccumulatorRef.current = '';
  };

  // Submit Answer to AI Interviewer
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || candidateInput).trim();
    if (!text || !session) return;

    setCandidateInput('');
    transcriptAccumulatorRef.current = '';

    // Detect filler words
    const fillers = ['um', 'uh', 'like', 'actually', 'basically', 'you know'];
    const detected: string[] = [];
    const lower = text.toLowerCase();
    fillers.forEach((f) => {
      if (new RegExp(`\\b${f}\\b`, 'i').test(lower)) {
        detected.push(f);
      }
    });

    const newCandidateMsg: TranscriptMessage = {
      id: `msg-${Date.now()}`,
      sender: 'candidate',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      fillerWordsDetected: detected,
    };

    const updatedTranscript = [...session.transcript, newCandidateMsg];
    const updatedSession = { ...session, transcript: updatedTranscript };
    setSession(updatedSession);
    localStorage.setItem(`interview_${sessionId}`, JSON.stringify(updatedSession));

    setIsAiThinking(true);

    try {
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: session.candidateName,
          role: session.targetRole,
          level: session.level,
          stage: session.stage,
          transcript: updatedTranscript,
          latestMessage: text,
        }),
      });

      const data = await res.json();
      const aiReply = (data.success && data.reply)
        ? data.reply
        : `Thank you for explaining that. Based on what you just shared, can you tell me more about your experience and the technical trade-offs you considered?`;

      const aiMsg: TranscriptMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: aiReply,
      };

      const finalTranscript = [...updatedTranscript, aiMsg];
      const finalSession = { ...session, transcript: finalTranscript };
      setSession(finalSession);
      localStorage.setItem(`interview_${sessionId}`, JSON.stringify(finalSession));

      speakText(aiReply);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!session) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          role: session.targetRole,
          level: session.level,
          transcript: session.transcript,
        }),
      });

      const data = await res.json();
      if (data.success && data.scorecard) {
        const completedSession: InterviewSession = {
          ...session,
          status: 'completed',
          scorecard: data.scorecard,
        };
        localStorage.setItem(`interview_${sessionId}`, JSON.stringify(completedSession));
        router.push(`/interview/${sessionId}/report`);
      }
    } catch (err) {
      console.error('Failed to generate scorecard:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const candidateMessages = session?.transcript.filter((m) => m.sender === 'candidate') || [];
  const totalWords = candidateMessages.reduce((sum, m) => sum + (m.text?.split(/\s+/).length || 0), 0);
  const fillerCount = candidateMessages.reduce((sum, m) => sum + (m.fillerWordsDetected?.length || 0), 0);

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-[#82889e] text-xs">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span>Loading interview session...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafbfe]">
      <TopHeader title="Mock Interview Room" />

      <div className="flex-1 p-6 sm:p-8 flex flex-col gap-4 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Status Bar */}
        <VitalsPanel
          level={session.level}
          role={session.targetRole}
          stage={session.stage}
          totalWords={totalWords}
          fillerWordsCount={fillerCount}
          isActive={session.status === 'in_progress'}
        />

        {/* Microphone Error Banner if triggered */}
        {micError && (
          <div className="p-3 rounded-xl bg-[#fff2f2] border border-[#ffc2c2] text-[#d93025] text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              onClick={() => setMicError(null)}
              className="text-[#d93025] hover:underline font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
          {/* Left Column: Interviewer Card */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm flex flex-col items-center text-center">
              <div className="w-18 h-18 rounded-full bg-[#f4f6fc] border-2 border-[#e2e7f3] flex items-center justify-center text-2xl my-2 shadow-sm relative">
                👩‍🏫
                {isAiSpeaking && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#3b5bf5] text-white rounded-full flex items-center justify-center text-[10px] animate-bounce shadow">
                    🔊
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#1c1e2d] mt-1">Lead Technical Interviewer</h3>
              <p className="text-xs text-[#82889e] mt-0.5 capitalize">
                {session.targetRole.replace('_', ' ')}
              </p>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (soundEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="mt-2 text-[11px] text-[#82889e] hover:text-[#1c1e2d] flex items-center gap-1 cursor-pointer transition-colors"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#3b5bf5]" /> Sound On
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" /> Sound Muted
                  </>
                )}
              </button>

              {/* Audio Visualizer */}
              <div className="w-full mt-4">
                <AudioVisualizer
                  isRecording={isRecording}
                  isAiSpeaking={isAiSpeaking}
                  audioStream={audioStream}
                />
              </div>

              {/* Actions */}
              <div className="w-full mt-5 space-y-2.5">
                <Link
                  href={`/interview/${sessionId}/coding`}
                  className="w-full py-2.5 rounded-xl bg-[#f4f6fc] hover:bg-[#eef2fc] text-[#3b5bf5] border border-[#e2e7f3] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Switch to Code Editor</span>
                </Link>

                <button
                  onClick={handleFinishInterview}
                  disabled={isEvaluating}
                  className="w-full py-2.5 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Performance...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      <span>Finish & Get Scorecard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dialogue Transcript & Responsive Voice Input */}
          <div className="md:col-span-8 flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#edf0f7] shadow-sm min-h-[460px]">
            <div className="flex-1 overflow-y-auto mb-4">
              <ChatTranscript
                transcript={session.transcript}
                interviewerName="Interviewer"
                onSpeakText={speakText}
              />

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-[#3b5bf5] mt-3 ml-1 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Interviewer is listening and analyzing your answer...</span>
                </div>
              )}
            </div>

            {/* Input / Voice Recording Area */}
            <div className="pt-3 border-t border-[#f0f2f8]">
              {isRecording ? (
                /* ACTIVE VOICE RECORDING PANEL */
                <div className="p-4 rounded-2xl bg-[#f4f7fe] border-2 border-[#3b5bf5]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#ff4d4f] animate-ping" />
                      <span className="text-xs font-bold text-[#1c1e2d]">
                        Microphone Active — Speak your answer now
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e8edfc] text-[#3b5bf5] font-medium">
                        {selectedLanguage === 'en-IN' ? 'English (India)' : selectedLanguage === 'ml-IN' ? 'Malayalam' : selectedLanguage}
                      </span>
                    </div>
                    <button
                      onClick={cancelRecording}
                      className="text-xs text-[#82889e] hover:text-[#d93025] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Live speech preview */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#dce4f9] min-h-[56px] text-xs text-[#1c1e2d] flex items-center shadow-xs">
                    {candidateInput ? (
                      <span className="leading-relaxed font-medium text-[#1c1e2d]">{candidateInput}</span>
                    ) : (
                      <span className="text-[#82889e] italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3b5bf5] animate-pulse" />
                        Listening to your microphone... Words will appear here as you speak.
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleReviewAndEdit}
                      disabled={!candidateInput.trim()}
                      className="text-[11px] text-[#51576f] hover:text-[#3b5bf5] disabled:opacity-40 underline underline-offset-2 cursor-pointer font-medium"
                    >
                      ✏️ Edit words in text box before sending
                    </button>

                    <button
                      onClick={stopRecordingAndSend}
                      className="px-5 py-2.5 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all ml-auto"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Done Speaking (Send Answer)</span>
                    </button>
                  </div>
                </div>
              ) : isTranscribingAudio ? (
                /* TRANSCRIBING AUDIO INDICATOR */
                <div className="p-4 rounded-xl bg-[#f4f7fe] border border-[#dce4f9] flex items-center justify-center gap-2 text-xs text-[#3b5bf5]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing and transcribing your voice answer...</span>
                </div>
              ) : (
                /* DEFAULT INPUT BAR */
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-[#82889e]">
                    <div className="flex items-center gap-2">
                      <span>Mic Language:</span>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value as any)}
                        className="bg-[#f4f6fc] border border-[#e2e7f3] rounded-lg px-2 py-0.5 text-xs text-[#1c1e2d] focus:outline-none focus:border-[#3b5bf5] cursor-pointer"
                      >
                        <option value="en-IN">English (India) - en-IN</option>
                        <option value="en-US">English (US) - en-US</option>
                        <option value="en-GB">English (UK) - en-GB</option>
                        <option value="ml-IN">Malayalam (മലയാളം) - ml-IN</option>
                      </select>
                    </div>
                    <span className="hidden sm:inline">Tip: Answer naturally using STAR framework (Situation, Task, Action, Result)</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Speak Button */}
                    <button
                      onClick={startRecording}
                      className="px-4 py-2.5 rounded-xl bg-[#3b5bf5] hover:bg-[#2e4de6] text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all flex-shrink-0"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Speak Answer</span>
                    </button>

                    {/* Text input */}
                    <input
                      type="text"
                      value={candidateInput}
                      onChange={(e) => setCandidateInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Or type your response here and press Enter..."
                      className="flex-1 bg-[#fafbfe] border border-[#e2e7f3] text-xs sm:text-sm text-[#1c1e2d] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#3b5bf5]"
                    />

                    {/* Send Button */}
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!candidateInput.trim()}
                      className="p-3 rounded-xl bg-white border border-[#e2e7f3] hover:border-[#3b5bf5] text-[#3b5bf5] disabled:opacity-40 font-semibold text-xs transition-colors cursor-pointer flex-shrink-0"
                      title="Send text answer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-[11px] text-[#82889e] mt-2 px-1 flex justify-between">
                    <span>Click <strong>"Speak Answer"</strong> to answer out loud with your real voice.</span>
                    <span>Press Enter to Submit</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewRoomPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#82889e]">Loading interview room...</div>}>
      <InterviewRoomContent />
    </Suspense>
  );
}
