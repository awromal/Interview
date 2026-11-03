export type CandidateLevel = 
  | 'beginner' // Freshers, college grads (Focus on basics, guided questions)
  | 'intermediate' // 1-3 years (Applied problem solving, optimization)
  | 'pro'; // 4+ years (Architecture, trade-offs, leadership, edge cases)

export type InterviewStage = 
  | 'level_1_resume'     // ATS Resume Screening & JD Match
  | 'level_2_behavioral' // HR & Soft Skills / STAR Method
  | 'level_3_tech_screen'// Core CS & Tech Concepts
  | 'level_4_coding'     // Live Coding Sandbox (Monaco)
  | 'level_5_system_design'; // High-Level Architecture

export type JobRole = 
  | 'fullstack_developer'
  | 'frontend_developer'
  | 'backend_developer'
  | 'mobile_developer'
  | 'devops_engineer'
  | 'ai_ml_engineer';

export interface UserProfile {
  name: string;
  email: string;
  targetRole?: JobRole;
  level?: CandidateLevel;
  createdAt: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSecret?: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: {
    javascript: string;
    typescript: string;
    python: string;
  };
  testCases: TestCase[];
  timeComplexityOptimal: string;
  spaceComplexityOptimal: string;
  hints: string[];
}

export interface Question {
  id: string;
  stage: InterviewStage;
  targetRole: JobRole;
  difficulty: CandidateLevel;
  title: string;
  questionText: string;
  category: 'HR' | 'Technical' | 'Coding' | 'SystemDesign' | 'Behavioral';
  expectedKeywords: string[];
  evaluationRubric: {
    poor: string;
    average: string;
    excellent: string;
  };
  codingChallenge?: CodingChallenge;
}

export interface TranscriptMessage {
  id: string;
  sender: 'ai' | 'candidate';
  timestamp: string;
  text: string;
  durationSeconds?: number;
  fillerWordsDetected?: string[];
  sentiment?: 'confident' | 'hesitant' | 'neutral';
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  targetRole: JobRole;
  level: CandidateLevel;
  stage: InterviewStage;
  createdAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  questions: Question[];
  transcript: TranscriptMessage[];
  scorecard?: Scorecard;
}

export interface Scorecard {
  overallScore: number; // 0 - 100
  breakdown: {
    technicalAccuracy: number; // 0 - 100
    communicationClarity: number; // 0 - 100
    confidenceAndPacing: number; // 0 - 100
    starMethodAlignment: number; // 0 - 100
    problemSolvingApproach: number; // 0 - 100
  };
  speechMetrics: {
    totalWords: number;
    wordsPerMinute: number;
    fillerWordsCount: number;
    topFillerWords: { word: string; count: number }[];
  };
  strengths: string[];
  areasOfImprovement: string[];
  actionPlan: {
    step: number;
    recommendation: string;
    topicToStudy: string;
  }[];
  detailedQuestionEvaluations: {
    questionId: string;
    questionText: string;
    candidateAnswer: string;
    score: number;
    feedback: string;
    idealAnswerOutline: string;
  }[];
}

export interface GeneratedResumeQuestion {
  id: string;
  question: string;
  context: string; // which project or skill from resume triggered this question
  difficulty: 'Fresher' | 'Intermediate' | 'Advanced';
}

export interface ATSAnalysisResult {
  atsScore: number; // 0 - 100
  formattingScore: number; // 0 - 100
  metricsScore: number; // 0 - 100
  actionVerbsScore: number; // 0 - 100
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedActionItems: string[];
  experienceLevelEstimate: CandidateLevel;
  strengthsIdentified: string[];
  improvementSuggestions: string[];
  resumeSectionsFound: {
    section: string;
    status: 'present' | 'missing' | 'warning';
    tip: string;
  }[];
  customInterviewSyllabus: {
    topic: string;
    reason: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
  generatedQuestions: GeneratedResumeQuestion[];
}
