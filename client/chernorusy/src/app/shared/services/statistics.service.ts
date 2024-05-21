import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { catchError, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  constructor(private httpS: HttpService) {}

  getAverageAnswerTime$(
    managerIds: string[],
    startTimestamp: Date | string | number,
    endTimestamp: Date | string | number
  ) {
    [startTimestamp, endTimestamp] = this.prependDates(
      startTimestamp,
      endTimestamp
    );
    return this.httpS
      .post<GetAverageAnswerTimeResponse[]>('/Statistics/AverageAnswerTime', {
        startTime: startTimestamp,
        endTime: endTimestamp,
        managerIds: managerIds,
      })
      .pipe(catchError(() => []));
  }

  getActivityStats$(
    managerIds: string[],
    startTimestamp: Date | string | number,
    endTimestamp: Date | string | number
  ) {
    [startTimestamp, endTimestamp] = this.prependDates(
      startTimestamp,
      endTimestamp
    );
    return this.httpS.post<GetActivityStatsResponse[]>(
      '/Statistics/ActivityStats',
      {
        managerIds,
        startTime: startTimestamp,
        endTime: endTimestamp,
      }
    );
  }

  getFirstMessageAverageAnswerTime(
    managerIds: string[],
    startTimestamp: Date | string | number,
    endTimestamp: Date | string | number
  ) {
    [startTimestamp, endTimestamp] = this.prependDates(
      startTimestamp,
      endTimestamp
    );
    return this.httpS.post<GetAverageAnswerTimeResponse[]>(
      '/Statistics/FirstMessageAverageAnswerTime',
      {
        managerIds,
        startTime: startTimestamp,
        endTime: endTimestamp,
      }
    );
  }

  private prependDates(
    startTimestamp: Date | string | number,
    endTimestamp: Date | string | number
  ): [string, string] {
    return [startTimestamp, endTimestamp].map((d) =>
      new Date(d).toISOString()
    ) as [string, string];
  }
}

export interface GetAverageAnswerTimeResponse {
  managerId: string;
  averageTime: {
    ticks: number;
    days: number;
    hours: number;
    milliseconds: number;
    microseconds: number;
    nanoseconds: number;
    minutes: number;
    seconds: number;
    totalDays: number;
    totalHours: number;
    totalMilliseconds: number;
    totalMicroseconds: number;
    totalNanoseconds: number;
    totalMinutes: number;
    totalSeconds: number;
  } | null;
}

export interface GetActivityStatsResponse {
  managerId: string;
  dailyStat: { date: string; dialogsCount: number; messagesCount: number }[];
  totalMessagesCount: number;
}
