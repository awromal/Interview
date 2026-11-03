import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, GEMINI_MODEL_FLASH } from '@/lib/gemini/client';
import { getInterviewerPersonaPrompt } from '@/lib/gemini/prompts';
import { CandidateLevel, JobRole, InterviewStage, TranscriptMessage } from '@/lib/types/interview';

export async function POST(req: NextRequest) {
  try {
    const {
      candidateName,
      role = 'fullstack_developer',
      level = 'beginner',
      stage = 'level_2_behavioral',
      transcript = [],
      latestMessage = '',
    } = await req.json();

    if (!latestMessage || !latestMessage.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 1. Try Gemini 2.5 Flash for live dynamic conversational interviewer
    if (apiKey) {
      try {
        const client = getGeminiClient();
        const systemPrompt = getInterviewerPersonaPrompt(
          role as JobRole,
          level as CandidateLevel,
          stage as InterviewStage,
          candidateName || 'Candidate'
        );

        // Build multi-turn contents
        const contents: any[] = [];

        // Add history (last 10 turns)
        const recentHistory = (transcript as TranscriptMessage[]).slice(-8);
        for (const msg of recentHistory) {
          contents.push({
            role: msg.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }],
          });
        }

        // Add latest user message
        contents.push({
          role: 'user',
          parts: [{ text: latestMessage }],
        });

        const response = await client.models.generateContent({
          model: GEMINI_MODEL_FLASH,
          contents,
          config: {
            systemInstruction: {
              parts: [
                {
                  text: `${systemPrompt}
CRITICAL INSTRUCTIONS FOR LIVE CONVERSATION:
- Do NOT use pre-scripted generic questions.
- Actively acknowledge and react to the specific details the candidate just shared (e.g. mention their projects, tools, frameworks, or challenges they brought up).
- If the candidate asks you a question (e.g. about company culture, team stack, or clarification), answer it warmly, then ask your next interview question.
- If the candidate's answer was brief, ask a natural probing follow-up (e.g., "Could you walk me through the specific part you built?").
- If their answer was thorough, validate it and transition to the next logical stage topic.
- Keep your reply to 2-3 spoken sentences max so it sounds natural on audio.
`,
                },
              ],
            },
            temperature: 0.7,
            maxOutputTokens: 250,
          },
        });

        const replyText = response.text?.trim();
        if (replyText) {
          return NextResponse.json({ success: true, reply: replyText });
        }
      } catch (geminiError: any) {
        console.warn('Gemini chat generation failed, using intelligent dynamic fallback:', geminiError);
      }
    }

    // 2. Intelligent Dynamic Reactive Fallback (Reads and reacts directly to user's answer)
    const lower = latestMessage.toLowerCase();
    const candidateDisplayName = candidateName && candidateName !== 'Candidate' ? candidateName : '';
    let dynamicReply = '';

    // Check if candidate asked the interviewer a question
    const isCandidateAsking = /(\?|what|how|can you tell me|could you tell me|what is the company|tech stack)/i.test(lower);

    // Check if candidate is introducing themselves
    const isSelfIntro = /^(my name is|i am|i'm|myself|hello|hi|i graduated)/i.test(lower.trim()) || lower.includes('passionate about') || lower.includes('experience in');

    // Detect mentioned technologies
    const detectedTech: string[] = [];
    const techWords = [
      'react', 'next.js', 'nextjs', 'vue', 'angular', 'node', 'express', 'python', 'django', 'fastapi',
      'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'flutter', 'dart', 'typescript', 'javascript',
      'tailwind', 'git', 'redux', 'firebase'
    ];
    techWords.forEach(tw => {
      if (lower.includes(tw)) detectedTech.push(tw.toUpperCase());
    });

    if (isCandidateAsking) {
      dynamicReply = `That's a thoughtful question to ask your interviewer! In our engineering team, we focus on autonomous ownership, clean architectures, and writing well-tested modular code. Coming back to your experiences${candidateDisplayName ? ', ' + candidateDisplayName : ''}, could you tell me how you handle code reviews and collaborating when teammates have differing design opinions?`;
    } else if (isSelfIntro && detectedTech.length > 0) {
      const techList = detectedTech.slice(0, 3).join(', ');
      dynamicReply = `Thank you for that introduction${candidateDisplayName ? ', ' + candidateDisplayName : ''}! It's great to hear your background working with ${techList}. In your recent work with these tools, what was a key architecture decision you made and what trade-offs did you consider?`;
    } else if (isSelfIntro) {
      dynamicReply = `Thank you for introducing yourself${candidateDisplayName ? ', ' + candidateDisplayName : ''}! To dive deeper into your engineering experience, what is a recent software project you developed that you found most challenging and rewarding?`;
    } else if (detectedTech.length > 0) {
      const techList = detectedTech.slice(0, 2).join(' and ');
      dynamicReply = `It is impressive that you have hands-on experience with ${techList}${candidateDisplayName ? ', ' + candidateDisplayName : ''}. In that project, what was the most difficult bottleneck or bug you had to diagnose, and what steps did you take to fix it?`;
    } else if (lower.includes('project') || lower.includes('college') || lower.includes('university') || lower.includes('internship')) {
      dynamicReply = `That sounds like a valuable real-world engineering project. When you were building that, what was your specific personal role, and how did you verify that your solution handled edge cases reliably?`;
    } else if (lower.includes('bug') || lower.includes('error') || lower.includes('fix') || lower.includes('debug')) {
      dynamicReply = `Debugging complex issues requires a systematic approach. When tackling that issue, what specific logs, profilers, or testing frameworks helped you find the root cause?`;
    } else if (lower.includes('team') || lower.includes('colleague') || lower.includes('agile') || lower.includes('scrum') || lower.includes('lead')) {
      dynamicReply = `Team communication is vital for our culture. Can you give an example of how you communicated technical trade-offs to non-technical stakeholders or agreed on a solution with team members?`;
    } else {
      // General dynamic follow-up that acknowledges what they said
      const words = latestMessage.trim().split(/\s+/);
      if (words.length < 15) {
        dynamicReply = `Thank you for sharing that${candidateDisplayName ? ', ' + candidateDisplayName : ''}! Could you elaborate a bit more on that? Specifically, walk me through a concrete code example or scenario where you applied that approach.`;
      } else {
        dynamicReply = `That provides valuable insight into your development style${candidateDisplayName ? ', ' + candidateDisplayName : ''}. Building on that, how do you approach code quality, unit testing, and ensuring systems are maintainable for the future?`;
      }
    }

    return NextResponse.json({
      success: true,
      reply: dynamicReply,
      fallback: true,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process message' }, { status: 500 });
  }
}
