import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // 데모 사용자들의 웹 푸시 구독 정보 삭제
    const result = await User.updateMany(
      { 
        companyId: 'demo',
        webPushSubscription: { $exists: true }
      },
      { 
        $unset: { webPushSubscription: "" }
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount}개의 구독 정보가 삭제되었습니다.`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Clear subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to clear subscriptions' },
      { status: 500 }
    );
  }
}