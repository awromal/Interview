import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, GEMINI_MODEL_FLASH } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
  try {
    const { questionText, candidateAnswer, context } = await req.json();

    if (!candidateAnswer || candidateAnswer.trim().length < 5) {
      return NextResponse.json({ error: 'Please provide an answer.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const client = getGeminiClient();
        const prompt = `
You are an expert Technical Interviewer.
The candidate was asked a question based on their resume:
Question: "${questionText}"
Context from resume: "${context}"
Candidate's Answer: "${candidateAnswer}"

Evaluate their answer objectively and return JSON:
{
  "score": number (0 to 100),
  "feedback": "Concise summary feedback (2-3 sentences)",
  "strengths": ["string"],
  "improvements": ["string"],
  "idealAnswerKeyPoints": ["string"]
}
`;
        const response = await client.models.generateContent({
          model: GEMINI_MODEL_FLASH,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json' },
        });

        const data = JSON.parse(response.text || '{}');
        return NextResponse.json({ success: true, evaluation: data });
      } catch (e) {
        console.warn('Gemini eval fallback:', e);
      }
    }

    // Heuristic feedback fallback
    const wordCount = candidateAnswer.trim().split(/\s+/).length;
    let score = 75;
    if (wordCount > 30) score += 10;
    if (wordCount < 15) score -= 15;

    const lower = candidateAnswer.toLowerCase();
    const hasTechnicalTerms = /(state|component|api|database|index|query|error|async|debug|performance|scale)/i.test(lower);
    if (hasTechnicalTerms) score += 8;

    score = Math.min(95, Math.max(50, score));

    return NextResponse.json({
      success: true,
      evaluation: {
        score,
        feedback: wordCount > 25
          ? 'Good explanation! You articulated your technical choices clearly. To make it even stronger, mention specific metrics or test cases you ran.'
          : 'Good start. Try adding more concrete details about what data structures or API methods you used in your code.',
        strengths: [
          'Directly addressed the question asked.',
          'Demonstrated practical familiarity with the concepts.',
        ],
        improvements: [
          'Quantify your results (e.g. "handled 500 req/sec" or "reduced re-renders by 40%").',
          'Mention how you tested or verified your solution.',
        ],
        idealAnswerKeyPoints: [
          'State the architecture choice directly',
          'Explain the reasoning and trade-offs considered',
          'Describe how you handled errors or edge cases',
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to evaluate answer' }, { status: 500 });
  }
}
