import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { Component, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import {
  combineLatestWith,
  map,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { AccountRole } from 'src/app/modules/profile/enums/AccountRole';
import { ProfileService } from 'src/app/shared/services/profile.service';
import {
  GetActivityStatsResponse,
  StatisticsService,
} from 'src/app/shared/services/statistics.service';
import { ECharts, EChartsOption } from 'echarts';
import { ChartDashboardItem } from '../../../charts';
import { DatePipe } from '@angular/common';
import {
  dateRangeChangesSymb,
  headerButtonsSymb,
  panelRemovedSymb,
} from '../../../chart-item';
import { IProfileResponseDTO } from 'src/app/modules/profile/DTO/response/ProfileResponseDTO';

@Component({
  selector: 'app-send-messages-overall-chart',
  templateUrl: './send-messages-overall.component.html',
  styleUrls: ['./send-messages-overall.component.scss'],
})
@ChartDashboardItem(
  'Кол-во сообщений по менеджерам по менеджерам',
  'send-messages-overall'
)
export class SendMessagesOverallComponent {
  [dateRangeChangesSymb]!: Observable<[from: Date, to: Date]>;
  [headerButtonsSymb] = new Subject();
  [panelRemovedSymb]!: Subject<void>;

  @ViewChildren('managerChoseBtn') managerChoseBtn!: TemplateRef<any>;

  instance: ECharts | null = null;
  setInstance(ev: any) {
    this.instance = ev;
  }

  options: EChartsOption = {
    grid: {
      bottom: 20,
      right: 20,
    },
    legend: {
      show: true,
      textStyle: {
        color: '#AAAAAA',
      },
    },
    xAxis: [
      {
        type: 'time',
        min: 'dataMin',
        max: 'dataMax',
        axisLabel: {
          showMinLabel: true,
          showMaxLabel: true,
          hideOverlap: true,
        },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
      },
    ],
    tooltip: {
      confine: true,
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
      appendTo: 'body',
      formatter: this.tooltipFormatter.bind(this),
    },
    series: [],
    dataZoom: [{ type: 'inside', filterMode: 'filter' }],
  };

  private tooltipFormatter(params: any) {
    const managerName = params.seriesName;
    const [date, count] = params.value;

    return `<time>${this.dateP.transform(date, 'yyyy-MM-dd')}</time>
    <hr>
    <b>${managerName}</b> сообщений: ${count}`;
  }

  destroy$ = new Subject<void>();

  constructor(
    private statisticsS: StatisticsService,
    private profileS: ProfileService,
    private dateP: DatePipe
  ) {}

  managerNames: { [managerId: string]: { name: string; surname: string } } = {};
  managers$ = this.profileS.getProfiles$({ Role: AccountRole.Manager }).pipe(
    map((resp) => resp.items),
    shareReplay()
  );
  deselectedManagers$ = new BehaviorSubject(new Set<string>());

  ngOnInit() {
    this[dateRangeChangesSymb]
      .pipe(
        takeUntil(this.destroy$),
        switchMap((dateRange) => this.getData$(...dateRange)),
        combineLatestWith(this.deselectedManagers$),
        map(([data, deselected]) => {
          const names = {} as any;
          Object.keys(data.names)
            .filter((managerId) => !deselected.has(managerId))
            .forEach((managerId) => (names[managerId] = data.names[managerId]));
          return {
            data: data.data.filter((d) => !deselected.has(d.managerId)),
            names,
          };
        })
      )
      .subscribe(({ data, names }) => {
        this.managerNames = names;
        const byManagerId = data.reduce((grouped, cur) => {
          if (!grouped[cur.managerId]) {
            grouped[cur.managerId] = [];
          }
          grouped[cur.managerId].push(...cur.dailyStat);
          return grouped;
        }, {} as { [managerId: string]: { date: string; messagesCount: number }[] });

        Object.keys(byManagerId).forEach((managerId) => {
          const stats = byManagerId[managerId];
          const groupedByDayMessagesCount = stats.reduce((grouped, cur) => {
            const date = new Date(cur.date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            const dayStr = `${year}::${month}::${day}`;
            if (!grouped[dayStr]) {
              grouped[dayStr] = [];
            }
            grouped[dayStr].push(cur.messagesCount);
            return grouped;
          }, {} as Record<string, number[]>);
          const finalData = Object.keys(groupedByDayMessagesCount)
            .map((dateString) => {
              const counts = groupedByDayMessagesCount[dateString];
              const countsSum = counts.reduce((acc, cur) => (acc += cur), 0);
              const meanCount = Math.ceil(countsSum / counts.length);
              const [year, month, day] = dateString.split('::').map(Number);
              const date = new Date(year, month, day, 0, 0, 0, 0).toISOString();
              return { date, messagesCount: meanCount };
            })
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          byManagerId[managerId] = finalData;
        });

        const values = Object.keys(byManagerId).map((managerId) => ({
          name: `${names[managerId].name} ${names[managerId].surname}`,
          type: 'line',
          data: byManagerId[managerId].map((d) => [d.date, d.messagesCount]),
        }));

        (this.options.series as any) = values;

        this.updateOptions();
      });
  }

  changeSelection(manager: IProfileResponseDTO, selected: boolean) {
    if (selected) {
      this.deselectedManagers$.value.delete(manager.id);
    } else {
      this.deselectedManagers$.value.add(manager.id);
    }
  }

  ngAfterViewInit() {
    this[headerButtonsSymb].next(this.managerChoseBtn);

    merge(fromEvent(window, 'beforeunload'), this[panelRemovedSymb]).subscribe(
      () => {
        const deselectedManagers = [...this.deselectedManagers$.value];
        localStorage.setItem(
          'app-received-dialogs-overall-chart',
          JSON.stringify({ deselectedManagers })
        );
      }
    );
    const deselectedManagers = JSON.parse(
      localStorage.getItem('app-received-dialogs-overall-chart') ??
        '{deselectedManagers: []}'
    );

    deselectedManagers.deselectedManagers.forEach((managerId: string) =>
      this.deselectedManagers$.value.add(managerId)
    );
    this.deselectedManagers$.next(this.deselectedManagers$.value);
  }

  updateOptions() {
    if (this.instance) {
      this.instance.setOption(this.options, true);
    } else {
      setTimeout(() => this.updateOptions());
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getData$(dateFrom: Date, dateTo: Date) {
    const names = {} as {
      [managerId: string]: { name: string; surname: string };
    };
    return this.managers$.pipe(
      map((items) =>
        items.map((item) => {
          names[item.id] = { name: item.name, surname: item.surname };
          return item.id;
        })
      ),
      switchMap((ids) =>
        this.statisticsS.getActivityStats$(ids, dateFrom, dateTo, false)
      ),
      map((stats) => ({ data: stats, names }))
    );
  }
}
