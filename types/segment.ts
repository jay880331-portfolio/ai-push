export interface ISegment {
  _id?: string;
  companyId: string;
  name: string;
  description?: string;
  rules: SegmentRule[];
  userCount?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SegmentRule {
  field: string;          // 'platform', 'lastLoginDays', 'tags', 'userIdInClientApp', 'appId'
  operator: SegmentOperator;
  value: any;
}

export type SegmentOperator = 
  | 'equals'              // 같음
  | 'not_equals'          // 같지 않음
  | 'contains'            // 포함
  | 'not_contains'        // 포함하지 않음
  | 'within_days'         // N일 이내
  | 'older_than_days'     // N일 이전
  | 'greater_than'        // 보다 큼
  | 'less_than'          // 보다 작음
  | 'greater_than_or_equal' // 이상
  | 'less_than_or_equal'  // 이하
  | 'between'            // 범위 내 (Phase 1 핵심)
  | 'not_between'        // 범위 외
  | 'in_array'           // 배열 내 포함
  | 'not_in_array'       // 배열 내 불포함
  | 'starts_with'        // 시작함
  | 'ends_with';         // 끝남

export interface CreateSegmentRequest {
  name: string;
  description?: string;
  rules: SegmentRule[];
}

export interface SegmentPreview {
  userCount: number;
  sampleUsers: Array<{
    userIdInClientApp: string;
    platform?: string;
    tags?: string[];
    lastActiveAt?: Date;
  }>;
}