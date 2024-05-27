import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ProfileService } from './profile.service';
import { AccountRole } from 'src/app/modules/profile/enums/AccountRole';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  constructor(private httpS: HttpService, private profileS: ProfileService) {}

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
    endTimestamp: Date | string | number,
    testData = false
  ): Observable<GetActivityStatsResponse[]> {
    if (testData) {
      const now = new Date();
      const dates = [
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 2
        ).toISOString(),
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        ).toISOString(),
        now.toISOString(),
      ];
      return this.profileS.getProfiles$({ Role: AccountRole.Manager }).pipe(
        map((managers) =>
          managers.items.map((manager) => ({
            managerId: manager.id,
            dailyStat: dates.map((date) => ({
              date,
              dialogsCount: Math.round(Math.random() * 30 + 1),
              messagesCount: Math.round(Math.random() * 30 + 1),
            })),
            totalMessagesCount: 0,
          }))
        )
      );
    }

    [startTimestamp, endTimestamp] = this.prependDates(
      startTimestamp,
      endTimestamp
    );
    return this.httpS
      .post<GetActivityStatsResponse[]>('/Statistics/ActivityStats', {
        managerIds,
        startTime: startTimestamp,
        endTime: endTimestamp,
      })
      .pipe(catchError(() => []));
  }

  getFirstMessageAverageAnswerTime(
    managerIds: string[],
    startTimestamp: Date | string | number,
    endTimestamp: Date | string | number
  ): Observable<GetAverageAnswerTimeResponse[]> {
    [startTimestamp, endTimestamp] = this.prependDates(
      startTimestamp,
      endTimestamp
    );

    return this.httpS
      .post<GetAverageAnswerTimeResponse[]>(
        '/Statistics/FirstMessageAverageAnswerTime',
        {
          managerIds,
          startTime: startTimestamp,
          endTime: endTimestamp,
        }
      )
      .pipe(catchError(() => []));
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
  /** "00:00:05.4811530" */
  averageTime: string | null;
}

export interface GetActivityStatsResponse {
  managerId: string;
  dailyStat: { date: string; dialogsCount: number; messagesCount: number }[];
  totalMessagesCount: number;
}
