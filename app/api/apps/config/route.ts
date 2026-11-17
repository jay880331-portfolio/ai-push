import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { CustomerAppRepository } from '@/data/repositories/CustomerAppRepository';
import { generateAndroidConfig, generateiOSConfig } from '@/lib/firebaseMultiApp';

export async function GET(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    // Connect to database
    await connectToDatabase();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const appId = searchParams.get('appId');
    const platform = searchParams.get('platform'); // 'android' or 'ios'
    
    if (!appId) {
      return NextResponse.json(
        { error: 'appId is required' },
        { status: 400 }
      );
    }

    if (!platform || !['android', 'ios'].includes(platform)) {
      return NextResponse.json(
        { error: 'platform must be android or ios' },
        { status: 400 }
      );
    }
    
    // Get customer app
    const customerAppRepository = new CustomerAppRepository();
    const customerApp = await customerAppRepository.getAppById(appId);
    
    if (!customerApp || customerApp.companyId !== authContext.companyId) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }
    
    // Generate configuration based on platform
    let config: any;
    let filename: string;
    
    if (platform === 'android') {
      config = generateAndroidConfig(customerApp);
      filename = 'google-services.json';
    } else {
      config = generateiOSConfig(customerApp);
      filename = 'GoogleService-Info.plist';
    }
    
    return NextResponse.json({
      success: true,
      config,
      filename,
      platform,
      app: {
        id: customerApp._id,
        name: customerApp.appName,
        packageName: customerApp.packageName,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/apps/config:', error);
    
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