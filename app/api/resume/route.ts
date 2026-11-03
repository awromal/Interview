import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, GEMINI_MODEL_FLASH } from '@/lib/gemini/client';
import { ATSAnalysisResult, GeneratedResumeQuestion, JobRole } from '@/lib/types/interview';

export async function POST(req: NextRequest) {
  try {
    let resumeText = '';
    let targetRole: JobRole = 'fullstack_developer';
    let jobDescription = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      targetRole = (formData.get('targetRole') as JobRole) || 'fullstack_developer';
      jobDescription = (formData.get('jobDescription') as string) || '';

      if (file) {
        const fileBuffer = await file.arrayBuffer();
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.pdf')) {
          try {
            const { PDFParse } = require('pdf-parse');
            const parser = new PDFParse({});
            await parser.load(new Uint8Array(fileBuffer));
            resumeText = await parser.getText();
          } catch (e) {
            console.warn('PDF parsing fallback to text decode:', e);
            // Fallback raw text decode from buffer
            const decoder = new TextDecoder('utf-8', { fatal: false });
            resumeText = decoder.decode(fileBuffer).replace(/[^\x20-\x7E\n\r\t]/g, ' ');
          }
        } else {
          // Plain text / markdown
          const decoder = new TextDecoder('utf-8', { fatal: false });
          resumeText = decoder.decode(fileBuffer);
        }
      }
    } else {
      const body = await req.json();
      resumeText = body.resumeText || '';
      targetRole = body.targetRole || 'fullstack_developer';
      jobDescription = body.jobDescription || '';
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return NextResponse.json(
        { error: 'Please provide at least 30 characters of resume content or upload a valid file.' },
        { status: 400 }
      );
    }

    const lowerResume = resumeText.toLowerCase();

    // 1. Keyword sets by role
    const roleKeywordBank: Record<JobRole, string[]> = {
      fullstack_developer: [
        'react', 'next.js', 'typescript', 'javascript', 'node.js', 'sql', 'postgresql',
        'api', 'rest', 'git', 'docker', 'ci/cd', 'tailwind', 'database', 'testing', 'state management'
      ],
      frontend_developer: [
        'react', 'next.js', 'typescript', 'javascript', 'html5', 'css3', 'tailwind',
        'redux', 'responsive', 'performance', 'webpack', 'ui/ux', 'git', 'testing'
      ],
      backend_developer: [
        'node.js', 'express', 'python', 'sql', 'postgresql', 'mongodb', 'docker',
        'api', 'rest', 'graphql', 'redis', 'microservices', 'git', 'aws', 'linux'
      ],
      mobile_developer: [
        'flutter', 'dart', 'react native', 'android', 'ios', 'swift', 'kotlin',
        'api', 'state management', 'mobile ui', 'git', 'firebase'
      ],
      devops_engineer: [
        'docker', 'kubernetes', 'ci/cd', 'linux', 'bash', 'aws', 'terraform',
        'monitoring', 'git', 'ansible', 'prometheus', 'cloud'
      ],
      ai_ml_engineer: [
        'python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
        'pandas', 'numpy', 'data analysis', 'sql', 'nlp', 'git'
      ],
    };

    const keywordsToCheck = roleKeywordBank[targetRole] || roleKeywordBank.fullstack_developer;
    const matchedKeywords = keywordsToCheck.filter((k) => lowerResume.includes(k)).map((k) => k.toUpperCase());
    const missingKeywords = keywordsToCheck.filter((k) => !lowerResume.includes(k)).slice(0, 5).map((k) => k.toUpperCase());

    // 2. Sections Detection
    const sections = [
      { section: 'Contact Info & Links', detected: /(@|github\.com|linkedin\.com|phone|\+91|\d{10})/i.test(resumeText), tip: 'Include professional links (GitHub, LinkedIn) and clean email.' },
      { section: 'Technical Skills', detected: /(skills|languages|technologies|frameworks|tools)/i.test(resumeText), tip: 'Group skills by Languages, Frameworks, and Tools for readability.' },
      { section: 'Projects', detected: /(projects|portfolio|built|developed|application)/i.test(resumeText), tip: 'Highlight 2-3 substantial projects with live demo or repository links.' },
      { section: 'Experience / Internship', detected: /(experience|employment|internship|work)/i.test(resumeText), tip: 'Describe achievements with impact rather than mere job responsibilities.' },
      { section: 'Education', detected: /(education|bachelor|degree|b\.tech|university|college|cgpa)/i.test(resumeText), tip: 'State your degree, year of graduation, and relevant achievements.' },
    ];

    const detectedCount = sections.filter((s) => s.detected).length;
    const formattingScore = Math.round((detectedCount / sections.length) * 100);

    // 3. Action Verbs Check
    const actionVerbs = [
      'developed', 'architected', 'built', 'implemented', 'optimized',
      'designed', 'created', 'engineered', 'deployed', 'spearheaded', 'integrated'
    ];
    const foundVerbs = actionVerbs.filter((v) => lowerResume.includes(v));
    const actionVerbsScore = Math.min(100, Math.round((foundVerbs.length / 5) * 100));

    // 4. Quantifiable Metrics Check (Numbers, percentages, time savings)
    const metricsMatches = resumeText.match(/(\d+%\s*|\$\d+|\d+\+|\b\d{2,}\b)/g) || [];
    const metricsScore = Math.min(100, Math.round((metricsMatches.length / 4) * 100));

    // Overall ATS Score calculation
    const keywordScore = Math.min(100, Math.round((matchedKeywords.length / keywordsToCheck.length) * 100));
    const overallScore = Math.round(
      keywordScore * 0.4 + formattingScore * 0.3 + actionVerbsScore * 0.15 + metricsScore * 0.15
    );

    // 5. Generate tailored live mock interview questions from the resume content
    const generatedQuestions: GeneratedResumeQuestion[] = [];

    // Question 1: Based on project
    if (lowerResume.includes('react') || lowerResume.includes('next.js')) {
      generatedQuestions.push({
        id: 'rq-1',
        question: 'In your resume, you highlighted building web applications with React. How did you structure component state and prevent unnecessary re-renders?',
        context: 'Triggered by React / Frontend projects in your resume',
        difficulty: 'Fresher',
      });
    } else {
      generatedQuestions.push({
        id: 'rq-1',
        question: 'Walk me through the most technically challenging project on your resume. What was the architecture and your primary responsibility?',
        context: 'Triggered by Project highlights in your resume',
        difficulty: 'Fresher',
      });
    }

    // Question 2: Based on database / backend
    if (lowerResume.includes('sql') || lowerResume.includes('postgresql') || lowerResume.includes('mongo')) {
      generatedQuestions.push({
        id: 'rq-2',
        question: 'You mentioned database modeling on your resume. When designing tables or schemas, how did you handle relationships and indexing for performance?',
        context: 'Triggered by Database & SQL skills listed',
        difficulty: 'Intermediate',
      });
    } else {
      generatedQuestions.push({
        id: 'rq-2',
        question: 'When an API or service you built encounters unexpected network latency or errors, how do you handle retries and error reporting?',
        context: 'Triggered by API & Services experience',
        difficulty: 'Intermediate',
      });
    }

    // Question 3: Based on problem solving & debugging
    generatedQuestions.push({
      id: 'rq-3',
      question: 'Tell me about an unexpected production bug or edge case you had to debug. What tools did you use to trace the problem?',
      context: 'Triggered by debugging & practical implementation',
      difficulty: 'Intermediate',
    });

    const result: ATSAnalysisResult = {
      atsScore: overallScore,
      formattingScore,
      metricsScore,
      actionVerbsScore,
      matchedKeywords,
      missingKeywords,
      suggestedActionItems: [
        formattingScore < 80 ? 'Ensure clear section headings (Summary, Skills, Projects, Education) so ATS scanners parse them correctly.' : 'Good section layout detected.',
        metricsScore < 60 ? 'Add quantifiable results to project bullet points (e.g., "Reduced response latency by 30%", "Tested with 1,000 requests").' : 'Quantifiable metrics present.',
        actionVerbsScore < 60 ? 'Use strong engineering action verbs ("Architected", "Engineered", "Optimized") instead of passive phrasing.' : 'Strong engineering verbs detected.',
      ],
      experienceLevelEstimate: matchedKeywords.length > 8 ? 'intermediate' : 'beginner',
      strengthsIdentified: [
        `Matched ${matchedKeywords.length} core technical keywords for ${targetRole.replace('_', ' ')}.`,
        `Identified ${sections.filter((s) => s.detected).length} of 5 essential ATS resume sections.`,
        `Actionable project implementations found.`,
      ],
      improvementSuggestions: [
        'Place contact links (GitHub and LinkedIn) right at the top header.',
        'Align skills to match the exact keywords in candidate job descriptions.',
      ],
      resumeSectionsFound: sections.map((s) => ({
        section: s.section,
        status: s.detected ? 'present' : 'missing',
        tip: s.tip,
      })),
      customInterviewSyllabus: [
        {
          topic: `${targetRole.replace('_', ' ').toUpperCase()} Core Architecture`,
          reason: 'Directly tests the skills featured in your resume projects.',
          priority: 'High',
        },
        {
          topic: 'API Error Handling & Data Validation',
          reason: 'Common focus for software engineering technical screens.',
          priority: 'High',
        },
        {
          topic: 'Database Optimization & Indexing',
          reason: 'Strengthens technical depth on backend queries.',
          priority: 'Medium',
        },
      ],
      generatedQuestions,
    };

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Resume processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze resume' }, { status: 500 });
  }
}
