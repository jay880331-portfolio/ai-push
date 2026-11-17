import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateApiKey } from '@/lib/auth';
import { Segment } from '@/models/Segment';
import { User } from '@/models/User';
import { CreateSegmentRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    await connectToDatabase();

    const companyId = authContext.companyId;
    const segments = await Segment.find({ companyId }).sort({ createdAt: -1 });

    return NextResponse.json({ segments });
  } catch (error: any) {
    console.error('세그먼트 목록 조회 오류:', error);
    return NextResponse.json(
      { error: error.message || '세그먼트 목록을 가져오는데 실패했습니다' },
      { status: error.message?.includes('API key') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate API key
    const authContext = await authenticateApiKey(request);
    
    const body: CreateSegmentRequest = await request.json();
    const { name, description, rules } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: '세그먼트 이름은 필수입니다' },
        { status: 400 }
      );
    }

    if (!rules || rules.length === 0) {
      return NextResponse.json(
        { error: '최소 하나의 규칙이 필요합니다' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const companyId = authContext.companyId;

    // 중복 이름 체크
    const existingSegment = await Segment.findOne({ companyId, name: name.trim() });
    if (existingSegment) {
      return NextResponse.json(
        { error: '이미 존재하는 세그먼트 이름입니다' },
        { status: 400 }
      );
    }

    // 사용자 수 계산
    const userCount = await calculateSegmentUserCount(companyId, rules);

    const segment = new Segment({
      companyId,
      name: name.trim(),
      description: description?.trim(),
      rules,
      userCount,
      isActive: true
    });

    await segment.save();

    return NextResponse.json({ 
      message: '세그먼트가 성공적으로 생성되었습니다',
      segment 
    });
  } catch (error: any) {
    console.error('세그먼트 생성 오류:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: '이미 존재하는 세그먼트 이름입니다' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || '세그먼트 생성에 실패했습니다' },
      { status: error.message?.includes('API key') ? 401 : 500 }
    );
  }
}

async function calculateSegmentUserCount(companyId: string, rules: any[]) {
  try {
    const query = buildSegmentQuery(companyId, rules);
    const count = await User.countDocuments(query);
    return count;
  } catch (error) {
    console.error('사용자 수 계산 오류:', error);
    return 0;
  }
}

function buildSegmentQuery(companyId: string, rules: any[]) {
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
        // value should be array [min, max] or string "min,max"
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