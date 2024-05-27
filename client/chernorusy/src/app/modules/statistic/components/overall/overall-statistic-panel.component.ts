import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ProfileService } from '../../../../shared/services/profile.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AccountRole } from '../../../profile/enums/AccountRole';
import { IProfileResponseDTO } from '../../../profile/DTO/response/ProfileResponseDTO';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  fromEvent,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  shareReplay,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs';
import {
  AllRatings,
  RatingService,
} from '../../../../shared/services/rating.service';
import { MatTableDataSource } from '@angular/material/table';
import {
  ColumnMode,
  DatatableComponent,
  TableColumn,
} from '@swimlane/ngx-datatable';
import { ChatSearchService } from '../../../../shared/services/chat-search.service';
import { ChatStatus } from '../../../chat/helpers/enums/ChatStatus';
import { StatisticComponent } from '../statistic/statistic.component';
import { StatisticsService } from '../../../../shared/services/statistics.service';

@Component({
  selector: 'app-overall-statistic-panel',
  templateUrl: 'overall-statistic-panel.component.html',
  styleUrls: ['overall-statistic-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverallStatisticPanelComponent {
  constructor(
    private statS: StatisticsService,
    private profileS: ProfileService
  ) {}
  private managers$ = this.profileS
    .getProfiles$({ Role: AccountRole.Manager })
    .pipe(
      map(({ items }) => items),
      shareReplay()
    );

  avgTime$ = this.managers$.pipe(
    map((managers) => managers.map((m) => m.id)),
    switchMap((ids) =>
      this.statS.getAverageAnswerTime$(ids, ...this.getThisMonthDateSpan())
    ),
    map((resp) => {
      resp = resp.filter((r) => !!r.averageTime);
      const count = resp.length;
      if (count === 0) {
        return null;
      }
      const today = new Date();
      const sumMs = resp.reduce((acc, { averageTime }) => {
        if (!averageTime) {
          return acc;
        }
        const a = /(?<hours>\d\d):(?<minutes>\d\d):(?<seconds>\d\d)\./g.exec(
          averageTime
        )!;
        const { hours, minutes, seconds } = a.groups!;
        const milliseconds =
          +hours * 60 * 60 * 1000 + +minutes * 60 * 1000 + +seconds * 1000;
        return (acc += milliseconds);
      }, 0);
      const averageMs = Math.round(sumMs / count);
      return averageMs;
    })
  );

  avgTimeFirst$ = this.managers$.pipe(
    map((managers) => managers.map((m) => m.id)),
    switchMap((ids) =>
      this.statS.getFirstMessageAverageAnswerTime(
        ids,
        ...this.getThisMonthDateSpan()
      )
    ),
    map((resp) => {
      resp = resp.filter((r) => !!r.averageTime);
      const count = resp.length;
      if (count === 0) {
        return null;
      }
      const today = new Date();
      const sumMs = resp.reduce((acc, { averageTime }) => {
        if (!averageTime) {
          return acc;
        }
        const a = /(?<hours>\d\d):(?<minutes>\d\d):(?<seconds>\d\d)\./g.exec(
          averageTime
        )!;
        const { hours, minutes, seconds } = a.groups!;
        const milliseconds =
          +hours * 60 * 60 * 1000 + +minutes * 60 * 1000 + +seconds * 1000;
        return (acc += milliseconds);
      }, 0);
      const averageMs = Math.round(sumMs / count);
      return averageMs;
    })
  );

  private getThisMonthDateSpan(): [Date, Date] {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 0);
    return [today, start];
  }

  Math = Math;
}
