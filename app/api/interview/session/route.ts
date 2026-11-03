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

    let initialAiGreeting = `Hello ${candidateName || 'there'}! Welcome to your mock interview session for the ${selectedRole.replace('_', ' ')} position. I'm your interviewer today. Let's begin: Can you introduce yourself, your experience in software development, and what projects you are currently building?`;

    if (selectedStage === 'level_2_behavioral') {
      initialAiGreeting = `Hello ${candidateName || 'there'}! Welcome to your HR & Behavioral interview for the ${selectedRole.replace('_', ' ')} position. I'm your interviewer today. To get started, could you please introduce yourself, tell me about your background, and what drives your passion in software engineering?`;
    } else if (selectedStage === 'level_3_tech_screen') {
      initialAiGreeting = `Hello ${candidateName || 'there'}! Welcome to your Technical Fundamentals round for the ${selectedRole.replace('_', ' ')} role. To get started: What programming languages and frameworks are in your core tech stack, and how do you decide which technology to use for a new project?`;
    } else if (selectedStage === 'level_5_system_design') {
      initialAiGreeting = `Hello ${candidateName || 'there'}! Welcome to the System Design round. Today we'll explore scalable architectures. To begin, could you walk me through how you approach designing a scalable web service with high availability and database performance?`;
    }

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
