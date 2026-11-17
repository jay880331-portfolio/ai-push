import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  const health = {
    timestamp: new Date().toISOString(),
    mongodb: 'unknown',
    openai: 'unknown',
    environment: process.env.NODE_ENV,
  };

  // Test MongoDB connection
  try {
    await connectToDatabase();
    health.mongodb = 'connected';
  } catch (error: any) {
    health.mongodb = `error: ${error.message}`;
  }

  // Test OpenAI connection
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      health.openai = 'API key not configured';
    } else {
      const openai = new OpenAI({ apiKey: openaiKey });
      // Simple test call
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      health.openai = 'connected';
    }
  } catch (error: any) {
    health.openai = `error: ${error.message}`;
  }

  return NextResponse.json(health);
}
