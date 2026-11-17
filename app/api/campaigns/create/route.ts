import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { CreateCampaignUseCase } from '@/domain/usecases/CreateCampaign';

export async function POST(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Execute use case
    const createCampaignUseCase = new CreateCampaignUseCase();
    const campaign = await createCampaignUseCase.execute(prompt, authContext.companyId);
    
    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    console.error('Error in POST /api/campaigns/create:', error);
    
    if (error.message === 'API key is required' || error.message === 'Invalid API key') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}