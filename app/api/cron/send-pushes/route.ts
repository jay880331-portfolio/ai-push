import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { validateCronSecret } from '@/lib/auth';
import { SendScheduledPushesUseCase } from '@/domain/usecases/SendScheduledPushes';

export async function GET(request: NextRequest) {
  return handleCronJob(request);
}

export async function POST(request: NextRequest) {
  return handleCronJob(request);
}

async function handleCronJob(request: NextRequest) {
  try {
    // Validate cron secret
    if (!validateCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Execute use case
    const sendScheduledPushesUseCase = new SendScheduledPushesUseCase();
    const result = await sendScheduledPushesUseCase.execute();
    
    console.log(`Cron job completed: ${result.processedCampaigns} campaigns processed, ${result.totalSent} pushes sent`);
    
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in cron job /api/cron/send-pushes:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}