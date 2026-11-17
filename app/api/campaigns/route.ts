import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { GetCampaignsUseCase } from '@/domain/usecases/GetCampaigns';

export async function GET(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    // Connect to database
    await connectToDatabase();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    
    // Execute use case
    const getCampaignsUseCase = new GetCampaignsUseCase();
    
    let campaigns;
    if (status && ['draft', 'scheduled', 'sent', 'failed'].includes(status)) {
      campaigns = await getCampaignsUseCase.getByStatus(
        authContext.companyId,
        status as any
      );
    } else {
      campaigns = await getCampaignsUseCase.execute(
        authContext.companyId,
        limit ? parseInt(limit, 10) : 50
      );
    }
    
    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/campaigns:', error);
    
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