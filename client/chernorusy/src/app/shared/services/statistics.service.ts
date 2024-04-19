import {Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {catchError, tap} from "rxjs";

@Injectable({providedIn: 'root'})
export class StatisticsService {
  constructor(
    private httpS: HttpService,
  ) {}

  getAverageAnswerTime$(managerIds: string[], startTimestamp: Date | string | number, endTimestamp: Date | string | number) {
    startTimestamp = new Date(startTimestamp).toISOString();
    endTimestamp = new Date(endTimestamp).toISOString();
    return this.httpS.post<GetAverageAnswerTimeResponse[]>('/Statistics/AverageAnswerTime', {
      startTime: startTimestamp,
      endTime: endTimestamp,
      managerIds: managerIds
    }).pipe(
      catchError(() => []),
    )
  }
}

export interface GetAverageAnswerTimeResponse {
  "managerId": string,
  "averageTime": {
    "ticks": number,
    "days": number,
    "hours": number,
    "milliseconds": number,
    "microseconds": number,
    "nanoseconds": number,
    "minutes": number,
    "seconds": number,
    "totalDays": number,
    "totalHours": number,
    "totalMilliseconds": number,
    "totalMicroseconds": number,
    "totalNanoseconds": number,
    "totalMinutes": number,
    "totalSeconds": number
  } | null
}
