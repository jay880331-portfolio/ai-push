import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ClickEvent } from '@/models/ClickEvent';
import { Campaign } from '@/models/Campaign';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { campaignId, companyId, timestamp, channel = 'web' } = body;
    
    if (!campaignId || !companyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 클릭 이벤트 저장
    const clickEvent = new ClickEvent({
      campaignId,
      companyId,
      channel,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown'
    });

    await clickEvent.save();

    // 캠페인 통계 업데이트
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: {
        'stats.webPushClicked': 1,
        'stats.totalClicked': 1
      }
    });

    // 클릭률 재계산
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      const totalSent = campaign.stats.mobileSent + campaign.stats.webPushSent + campaign.stats.emailSent;
      const totalClicked = campaign.stats.mobileClicked + campaign.stats.webPushClicked + campaign.stats.emailClicked;
      
      if (totalSent > 0) {
        campaign.stats.clickRate = (totalClicked / totalSent) * 100;
        await campaign.save();
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Click event tracked successfully' 
    });

  } catch (error) {
    console.error('Web push click tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track click event' },
      { status: 500 }
    );
  }
}