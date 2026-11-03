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
    let dynamicReply = '';

    // Check if candidate asked the interviewer a question
    const isCandidateAsking = /(\?|what|how|can you tell me|could you tell me|what is the company|tech stack)/i.test(lower);

    // Detect mentioned technologies
    const detectedTech: string[] = [];
    const techWords = [
      'react', 'next.js', 'vue', 'angular', 'node', 'express', 'python', 'django', 'fastapi',
      'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'flutter', 'dart', 'typescript', 'javascript'
    ];
    techWords.forEach(tw => {
      if (lower.includes(tw)) detectedTech.push(tw.toUpperCase());
    });

    if (isCandidateAsking) {
      dynamicReply = `That's a great question to ask your interviewer! In our engineering team, we focus on autonomous ownership, modern CI/CD pipelines, and writing well-tested modular code. Coming back to your background, could you tell me about how you approach collaborating on pull requests or technical disagreements with teammates?`;
    } else if (detectedTech.length > 0) {
      const techList = detectedTech.slice(0, 2).join(' and ');
      dynamicReply = `I love that you have hands-on experience with ${techList}! In that project, what was the most complex technical hurdle or performance bottleneck you had to overcome, and how did you resolve it?`;
    } else if (lower.includes('project') || lower.includes('college') || lower.includes('university') || lower.includes('internship')) {
      dynamicReply = `That sounds like a valuable real-world learning experience. When you were working on that, what was your specific personal contribution, and how did you verify that your code worked reliably?`;
    } else if (lower.includes('bug') || lower.includes('error') || lower.includes('fix') || lower.includes('debug')) {
      dynamicReply = `Debugging under pressure is a critical skill for any developer. When diagnosing that issue, what specific tools or logging techniques helped you isolate the root cause?`;
    } else if (lower.includes('team') || lower.includes('colleague') || lower.includes('agile') || lower.includes('scrum')) {
      dynamicReply = `Team collaboration is essential here. Can you tell me about a time when a teammate had a different opinion on code design or architecture, and how you reached a compromise?`;
    } else {
      // General dynamic follow-up that acknowledges what they said
      const words = latestMessage.trim().split(/\s+/);
      if (words.length < 15) {
        dynamicReply = `Thanks for sharing that! Could you elaborate a bit more on that experience? Specifically, walk me through an example from your code or project where you applied those concepts.`;
      } else {
        dynamicReply = `That gives great clarity into how you think about software development. Building on that, how do you ensure that the code you write is maintainable, well-documented, and ready for production?`;
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
