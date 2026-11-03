import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_QUESTIONS } from '@/lib/data/questions';
import { InterviewSession, CandidateLevel, JobRole, InterviewStage } from '@/lib/types/interview';

export async function POST(req: NextRequest) {
  try {
    const { candidateName, targetRole, level, stage } = await req.json();

    const selectedRole: JobRole = targetRole || 'fullstack_developer';
    const selectedLevel: CandidateLevel = level || 'beginner';
    const selectedStage: InterviewStage = stage || 'level_2_behavioral';

    // Filter relevant questions for this session
    let matchedQuestions = SAMPLE_QUESTIONS.filter(
      q => q.stage === selectedStage
    );

    if (matchedQuestions.length === 0) {
      matchedQuestions = SAMPLE_QUESTIONS.slice(0, 3);
    }

    const sessionId = 'session_' + Math.random().toString(36).substring(2, 9);

    const initialAiGreeting = `Hello ${candidateName || 'there'}! Welcome to your ${selectedStage.replace('level_', 'Stage ').replace('_', ' ')} interview for the ${selectedRole.replace('_', ' ')} position. I'm your AI interviewer today. Whenever you're ready, let's begin with our first question!`;

    const newSession: InterviewSession = {
      id: sessionId,
      candidateName: candidateName || 'Candidate',
      targetRole: selectedRole,
      level: selectedLevel,
      stage: selectedStage,
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      currentQuestionIndex: 0,
      questions: matchedQuestions,
      transcript: [
        {
          id: 'msg-0',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: initialAiGreeting,
        },
      ],
    };

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create session' }, { status: 500 });
  }
}
