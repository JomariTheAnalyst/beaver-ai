import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { imageData, filename } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create the image part for Gemini
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: getMimeType(filename),
      },
    };

    // Generate content with the image
    const prompt = `Analyze this image and provide a brief description of what you see. Focus on:
    1. The main subjects or objects in the image
    2. The style, design, or aesthetic
    3. Any UI/UX elements if it's a design mockup
    4. Colors, layout, or composition
    5. How this might relate to web development or app design
    
    Keep the analysis concise but informative, around 2-3 sentences.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const analysis = response.text();

    return NextResponse.json({
      analysis: analysis.trim(),
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}