import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // 데모 사용자들 조회
    const users = await User.find({ 
      companyId: 'demo',
      webPushSubscription: { $exists: true }
    }).select({
      userIdInClientApp: 1,
      platform: 1,
      'webPushSubscription.endpoint': 1,
      tags: 1,
      lastActiveAt: 1,
      createdAt: 1
    }).lean();

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: users.map(user => ({
        id: user._id,
        userIdInClientApp: user.userIdInClientApp,
        platform: user.platform,
        hasWebPushSubscription: !!user.webPushSubscription,
        endpoint: user.webPushSubscription?.endpoint ? 
          user.webPushSubscription.endpoint.substring(0, 50) + '...' : null,
        tags: user.tags,
        lastActiveAt: user.lastActiveAt,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Debug users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}