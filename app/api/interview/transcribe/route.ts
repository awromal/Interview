import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, GEMINI_MODEL_FLASH } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = await audioFile.arrayBuffer();
    if (buffer.byteLength < 500) {
      return NextResponse.json({
        success: false,
        error: 'Recorded audio was too short or silent.',
      }, { status: 400 });
    }

    const base64Audio = Buffer.from(buffer).toString('base64');
    const mimeType = audioFile.type || 'audio/webm';

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const client = getGeminiClient();
        const response = await client.models.generateContent({
          model: GEMINI_MODEL_FLASH,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: 'You are an accurate audio transcriber. Transcribe the candidate speaking in this audio file word for word. Return ONLY the transcribed text. If the audio is silent or unintelligible, return an empty string.',
                },
                {
                  inlineData: {
                    mimeType: mimeType.includes('wav') ? 'audio/wav' : 'audio/webm',
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
        });

        const transcript = response.text?.trim() || '';
        if (transcript) {
          return NextResponse.json({ success: true, transcript });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini audio transcription failed:', geminiErr);
      }
    }

    // Never return fake dummy text! If no API key or failed, return honest error
    return NextResponse.json({
      success: false,
      error: 'Audio was recorded, but cloud transcription requires a GEMINI_API_KEY in .env.local. Please type your answer or use browser speech recognition.',
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process audio' }, { status: 500 });
  }
}
