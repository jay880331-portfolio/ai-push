import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TrackPushClickUseCase } from '@/domain/usecases/TrackPushClick';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { campaignId, userIdInClientApp, companyId } = body;
    
    // Validate required fields
    if (!campaignId || !userIdInClientApp || !companyId) {
      return NextResponse.json(
        { error: 'campaignId, userIdInClientApp, and companyId are required' },
        { status: 400 }
      );
    }
    
    // Get device info from headers
    const deviceInfo = {
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    };
    
    // Execute use case
    const trackPushClickUseCase = new TrackPushClickUseCase();
    const clickEvent = await trackPushClickUseCase.execute({
      campaignId,
      companyId,
      userIdInClientApp,
      deviceInfo,
    });
    
    return NextResponse.json({
      success: true,
      clickEventId: clickEvent._id,
    });
  } catch (error: any) {
    console.error('Error in POST /api/events/push-clicked:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}