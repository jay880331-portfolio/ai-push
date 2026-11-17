import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { CustomerApp } from '@/models/CustomerApp';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // API 키 인증
    const authContext = await authenticateApiKey(request);
    
    // 새로운 VAPID 키 쌍 생성
    const vapidKeys = webpush.generateVAPIDKeys();
    
    const body = await request.json();
    const { email, overwrite = false } = body;
    
    // 이메일 검증
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required for VAPID keys' },
        { status: 400 }
      );
    }

    // 기존 고객 앱 조회
    const existingApp = await CustomerApp.findOne({ 
      companyId: authContext.companyId 
    });

    if (existingApp?.vapidKeys?.publicKey && !overwrite) {
      return NextResponse.json(
        { 
          error: 'VAPID keys already exist. Use overwrite=true to replace them.',
          hasExistingKeys: true 
        },
        { status: 409 }
      );
    }

    // VAPID 키 저장/업데이트
    const updateData = {
      vapidKeys: {
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
        email: email
      }
    };

    if (existingApp) {
      // 기존 앱 업데이트
      await CustomerApp.findOneAndUpdate(
        { companyId: authContext.companyId },
        updateData
      );
    } else {
      // 새 앱 생성 (웹 푸시용)
      const newApp = new CustomerApp({
        companyId: authContext.companyId,
        appName: `${authContext.companyId} Web Push`,
        packageName: `com.${authContext.companyId}.webpush`,
        platform: 'web',
        apiKey: authContext.apiKey,
        ...updateData
      });
      await newApp.save();
    }

    return NextResponse.json({
      success: true,
      message: 'VAPID keys generated and saved successfully',
      keys: {
        publicKey: vapidKeys.publicKey,
        email: email
        // privateKey는 보안상 반환하지 않음
      }
    });

  } catch (error: any) {
    console.error('VAPID key generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate VAPID keys' },
      { status: 500 }
    );
  }
}