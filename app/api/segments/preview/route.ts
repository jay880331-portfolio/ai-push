import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { User } from '@/models/User';
import { SegmentRule } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    const { rules }: { rules: SegmentRule[] } = await request.json();

    if (!rules || rules.length === 0) {
      return NextResponse.json(
        { error: '규칙이 필요합니다' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const companyId = authContext.companyId;
    const query = buildSegmentQuery(companyId, rules);

    // 총 사용자 수 계산
    const userCount = await User.countDocuments(query);

    // 샘플 사용자 조회 (최대 5명)
    const sampleUsers = await User.find(query)
      .select('userIdInClientApp platform tags lastActiveAt')
      .limit(5)
      .lean();

    const preview = {
      userCount,
      sampleUsers: sampleUsers.map(user => ({
        userIdInClientApp: user.userIdInClientApp,
        platform: user.platform,
        tags: user.tags,
        lastActiveAt: user.lastActiveAt
      }))
    };

    return NextResponse.json({ preview });
  } catch (error: any) {
    console.error('세그먼트 미리보기 오류:', error);
    return NextResponse.json(
      { error: error.message || '미리보기를 생성하는데 실패했습니다' },
      { status: error.message?.includes('API key') ? 401 : 500 }
    );
  }
}

function buildSegmentQuery(companyId: string, rules: SegmentRule[]) {
  const query: any = { companyId };

  rules.forEach(rule => {
    const { field, operator, value } = rule;

    switch (operator) {
      case 'equals':
        query[field] = value;
        break;
      case 'not_equals':
        query[field] = { $ne: value };
        break;
      case 'contains':
        if (field === 'tags') {
          query[field] = { $in: [value] };
        } else {
          query[field] = { $regex: value, $options: 'i' };
        }
        break;
      case 'not_contains':
        if (field === 'tags') {
          query[field] = { $nin: [value] };
        } else {
          query[field] = { $not: { $regex: value, $options: 'i' } };
        }
        break;
      case 'within_days':
        const withinDate = new Date();
        withinDate.setDate(withinDate.getDate() - parseInt(value));
        query[field] = { $gte: withinDate };
        break;
      case 'older_than_days':
        const olderDate = new Date();
        olderDate.setDate(olderDate.getDate() - parseInt(value));
        query[field] = { $lt: olderDate };
        break;
      case 'greater_than':
        query[field] = { $gt: parseFloat(value) };
        break;
      case 'less_than':
        query[field] = { $lt: parseFloat(value) };
        break;
      case 'greater_than_or_equal':
        query[field] = { $gte: parseFloat(value) };
        break;
      case 'less_than_or_equal':
        query[field] = { $lte: parseFloat(value) };
        break;
      case 'between':
        const range = Array.isArray(value) ? value : value.split(',').map((v: string) => parseFloat(v.trim()));
        if (range.length === 2) {
          query[field] = { $gte: range[0], $lte: range[1] };
        }
        break;
      case 'not_between':
        const notRange = Array.isArray(value) ? value : value.split(',').map((v: string) => parseFloat(v.trim()));
        if (notRange.length === 2) {
          query[field] = { $not: { $gte: notRange[0], $lte: notRange[1] } };
        }
        break;
      case 'starts_with':
        query[field] = { $regex: `^${value}`, $options: 'i' };
        break;
      case 'ends_with':
        query[field] = { $regex: `${value}$`, $options: 'i' };
        break;
      case 'in_array':
        const inValues = Array.isArray(value) ? value : [value];
        query[field] = { $in: inValues };
        break;
      case 'not_in_array':
        const notInValues = Array.isArray(value) ? value : [value];
        query[field] = { $nin: notInValues };
        break;
    }
  });

  return query;
}