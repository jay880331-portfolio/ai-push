import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { GetCustomerAppsUseCase } from '@/domain/usecases/RegisterCustomerApp';

export async function GET(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    // Connect to database
    await connectToDatabase();
    
    // Execute use case
    const getAppsUseCase = new GetCustomerAppsUseCase();
    const apps = await getAppsUseCase.execute(authContext.companyId);
    
    return NextResponse.json({
      success: true,
      apps,
      count: apps.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/apps:', error);
    
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