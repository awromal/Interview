'use client';

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  isAiSpeaking: boolean;
  audioStream?: MediaStream | null;
}

export function AudioVisualizer({ isRecording, isAiSpeaking, audioStream }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    if (isRecording && audioStream) {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);
      } catch (e) {
        console.warn('AudioContext error:', e);
      }
    }

    const dataArray = new Uint8Array(32);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = 4;
      const gap = 3;
      const totalBars = 24;
      const startX = (width - (totalBars * (barWidth + gap))) / 2;

      if (analyser && isRecording) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < totalBars; i++) {
        let barHeight = 6;
        if (isRecording && analyser) {
          const val = dataArray[i % dataArray.length] || 0;
          barHeight = Math.max(6, (val / 255) * height * 0.85);
        } else if (isAiSpeaking) {
          const wave = Math.sin(Date.now() / 180 + i * 0.4);
          barHeight = 10 + Math.abs(wave) * 28;
        }

        const x = startX + i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Clean, quiet monochrome palette
        if (isAiSpeaking) {
          ctx.fillStyle = '#e4e4e7'; // zinc-200
        } else if (isRecording) {
          ctx.fillStyle = '#a1a1aa'; // zinc-400
        } else {
          ctx.fillStyle = '#3f3f46'; // zinc-700
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isRecording, isAiSpeaking, audioStream]);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#141417] border border-zinc-800">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            isAiSpeaking
              ? 'bg-white animate-pulse'
              : isRecording
              ? 'bg-zinc-300 animate-pulse'
              : 'bg-zinc-600'
          }`}
        />
        <span className="text-[11px] font-medium text-zinc-400">
          {isAiSpeaking ? 'Interviewer Speaking' : isRecording ? 'Listening to You...' : 'Audio Ready'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={260}
        height={48}
        className="w-full max-w-[260px] h-12"
      />
    </div>
  );
}
