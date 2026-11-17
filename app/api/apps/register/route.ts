import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { RegisterCustomerAppUseCase } from '@/domain/usecases/RegisterCustomerApp';

export async function POST(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { appName, packageName, platform } = body;
    
    // Validate required fields
    if (!appName || !packageName || !platform) {
      return NextResponse.json(
        { error: 'appName, packageName, and platform are required' },
        { status: 400 }
      );
    }
    
    if (!['android', 'ios', 'both'].includes(platform)) {
      return NextResponse.json(
        { error: 'platform must be android, ios, or both' },
        { status: 400 }
      );
    }

    // Validate package name format
    const packageNameRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
    if (!packageNameRegex.test(packageName)) {
      return NextResponse.json(
        { error: 'Invalid package name format. Use reverse domain notation (e.g., com.company.app)' },
        { status: 400 }
      );
    }
    
    // Execute use case
    const registerAppUseCase = new RegisterCustomerAppUseCase();
    const customerApp = await registerAppUseCase.execute({
      companyId: authContext.companyId,
      appName,
      packageName,
      platform,
    });
    
    return NextResponse.json({
      success: true,
      app: customerApp,
    });
  } catch (error: any) {
    console.error('Error in POST /api/apps/register:', error);
    
    if (error.message === 'API key is required' || error.message === 'Invalid API key') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}