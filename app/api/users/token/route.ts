import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { RegisterUserTokenUseCase } from '@/domain/usecases/RegisterUserToken';

export async function POST(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { token, platform, userIdInClientApp, customAttributes, tags, appId, attributes } = body;
    
    // Validate required fields
    if (!token || !platform || !userIdInClientApp) {
      return NextResponse.json(
        { error: 'token, platform, and userIdInClientApp are required' },
        { status: 400 }
      );
    }
    
    if (!['ios', 'android'].includes(platform)) {
      return NextResponse.json(
        { error: 'platform must be either "ios" or "android"' },
        { status: 400 }
      );
    }
    
    // Execute use case
    const registerUserTokenUseCase = new RegisterUserTokenUseCase();
    const user = await registerUserTokenUseCase.execute({
      companyId: authContext.companyId,
      appId,
      userIdInClientApp,
      pushToken: token,
      platform,
      customAttributes,
      tags,
      attributes,
    });
    
    return NextResponse.json({
      success: true,
      user: {
        userIdInClientApp: user.userIdInClientApp,
        platform: user.platform,
        isActive: user.isActive,
        tags: user.tags,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/users/token:', error);
    
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