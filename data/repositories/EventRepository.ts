import { Event, IEvent } from '@/models/Event';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface EventQuery {
  companyId: string;
  appId?: string;
  userIds?: string[];
  eventName?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  properties?: Record<string, any>;
}

export interface EventAnalytics {
  eventName: string;
  count: number;
  uniqueUsers: number;
  lastOccurred: Date;
}

export class EventRepository {
  
  // 이벤트 추적
  async trackEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    const event = new Event(eventData);
    return await event.save();
  }

  // 이벤트 조회
  async findEvents(query: EventQuery, limit: number = 1000): Promise<IEvent[]> {
    const filter: any = {
      companyId: query.companyId
    };

    if (query.appId) {
      filter.appId = query.appId;
    }

    if (query.userIds && query.userIds.length > 0) {
      filter.userIdInClientApp = { $in: query.userIds };
    }

    if (query.eventName) {
      filter.eventName = query.eventName;
    }

    if (query.timeRange) {
      filter.timestamp = {
        $gte: query.timeRange.start,
        $lte: query.timeRange.end
      };
    }

    if (query.properties) {
      Object.keys(query.properties).forEach(key => {
        filter[`properties.${key}`] = query.properties![key];
      });
    }

    return await Event.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean() as unknown as IEvent[];
  }

  // 특정 이벤트를 수행한 사용자 조회
  async findUsersWithEvent(
    companyId: string, 
    eventName: string, 
    daysBack: number = 7,
    appId?: string
  ): Promise<string[]> {
    const filter: any = {
      companyId,
      eventName,
      timestamp: {
        $gte: subDays(new Date(), daysBack)
      }
    };

    if (appId) {
      filter.appId = appId;
    }

    const users = await Event.distinct('userIdInClientApp', filter);
    return users;
  }

  // 특정 이벤트를 수행하지 않은 사용자 조회
  async findUsersWithoutEvent(
    companyId: string,
    hasEventName: string,
    excludeEventName: string,
    daysBack: number = 7,
    appId?: string
  ): Promise<string[]> {
    // 1. hasEventName을 수행한 사용자들 찾기
    const usersWithHasEvent = await this.findUsersWithEvent(
      companyId, 
      hasEventName, 
      daysBack, 
      appId
    );

    if (usersWithHasEvent.length === 0) {
      return [];
    }

    // 2. 그 중에서 excludeEventName을 수행한 사용자들 찾기
    const usersWithExcludeEvent = await this.findUsersWithEvent(
      companyId, 
      excludeEventName, 
      daysBack, 
      appId
    );

    // 3. 차집합 반환
    return usersWithHasEvent.filter(userId => 
      !usersWithExcludeEvent.includes(userId)
    );
  }

  // 이벤트 분석 데이터
  async getEventAnalytics(
    companyId: string, 
    daysBack: number = 30,
    appId?: string
  ): Promise<EventAnalytics[]> {
    const filter: any = {
      companyId,
      timestamp: {
        $gte: subDays(new Date(), daysBack)
      }
    };

    if (appId) {
      filter.appId = appId;
    }

    const analytics = await Event.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userIdInClientApp' },
          lastOccurred: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          eventName: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          lastOccurred: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    return analytics;
  }

  // 사용자별 이벤트 히스토리
  async getUserEventHistory(
    companyId: string,
    userIdInClientApp: string,
    daysBack: number = 30
  ): Promise<IEvent[]> {
    return await Event.find({
      companyId,
      userIdInClientApp,
      timestamp: {
        $gte: subDays(new Date(), daysBack)
      }
    })
    .sort({ timestamp: -1 })
    .lean() as unknown as IEvent[];
  }
}

export const eventRepository = new EventRepository();