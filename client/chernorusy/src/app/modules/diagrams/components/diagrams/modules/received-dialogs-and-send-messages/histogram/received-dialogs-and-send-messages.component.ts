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
import { BarSeriesOption, ECharts, EChartsOption } from 'echarts';
import { ChartDashboardItem } from '../../../charts';
import { DatePipe } from '@angular/common';
import {
  ChartItem,
  dateRangeChangesSymb,
  headerButtonsSymb,
  panelRemovedSymb,
} from '../../../chart-item';
import { IProfileResponseDTO } from 'src/app/modules/profile/DTO/response/ProfileResponseDTO';
import { getFio } from 'src/app/shared/helpers/get-fio';

@Component({
  selector: 'app-received-dialogs-and-send-messages-histogram',
  templateUrl: './received-dialogs-and-send-messages.component.html',
  styleUrls: ['./received-dialogs-and-send-messages.component.scss'],
})
@ChartDashboardItem('Кол-во диалогов по менеджерам', 'received-dialogs-overall')
export class ReceivedDialogsAndSendMessagesComponent extends ChartItem {
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
      data: ['Диалоги', 'Сообщения'],
      textStyle: {
        color: '#AAAAAA',
      },
    },
    xAxis: [
      //Подгрузить имена манагеров
      {
        type: 'category',
        axisLabel: {
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
      trigger: 'axis',
      //formatter: this.tooltipFormatter.bind(this),
      axisPointer: {
        type: 'shadow',
        label: {
          show: true,
        },
      },
    },
    series: [],
    dataZoom: [{ type: 'inside', filterMode: 'filter' }],
  };

  private tooltipFormatter(params: any) {
    const name = params[0].name;
    const dialogsCount = params[0].data;
    const messagesCount = params[1].data;

    return `<b>${name}</b><br><span>Диалоги: ${dialogsCount}</span><br><span>Сообщения: ${messagesCount}</span>`;
  }

  destroy$ = new Subject<void>();

  constructor(
    private statisticsS: StatisticsService,
    private profileS: ProfileService,
    private dateP: DatePipe
  ) {
    super();
  }

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
        }, {} as { [managerId: string]: { date: string; dialogsCount: number; messagesCount: number }[] });

        Object.keys(byManagerId).forEach((managerId) => {
          const stats = byManagerId[managerId];
          const groupedByDayDialogsCount = stats.reduce((grouped, cur) => {
            const date = new Date(cur.date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            const dayStr = `${year}::${month}::${day}`;
            if (!grouped[dayStr]) {
              grouped[dayStr] = { dialogsCount: [], messagesCount: [] };
            }
            grouped[dayStr].dialogsCount.push(cur.dialogsCount);
            grouped[dayStr].messagesCount.push(cur.messagesCount);
            return grouped;
          }, {} as Record<string, { dialogsCount: number[]; messagesCount: number[] }>);
          const finalData = Object.keys(groupedByDayDialogsCount)
            .map((dateString) => {
              const counts = groupedByDayDialogsCount[dateString];
              const countsSum = counts.dialogsCount.reduce(
                (acc, cur) => (acc += cur),
                0
              );
              const meanCount = Math.ceil(
                countsSum / counts.dialogsCount.length
              );
              const messagesSum = counts.messagesCount.reduce(
                (acc, cur) => (acc += cur),
                0
              );
              const meanMessages = Math.ceil(
                messagesSum / counts.messagesCount.length
              );
              const [year, month, day] = dateString.split('::').map(Number);
              const date = new Date(year, month, day, 0, 0, 0, 0).toISOString();
              return {
                date,
                dialogsCount: meanCount,
                messagesCount: meanMessages,
              };
            })
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          byManagerId[managerId] = finalData;
        });

        const dialogValues = Object.keys(byManagerId).reduce((g, managerId) => {
          if (!byManagerId[managerId].length) {
            g.push(0);
            return g;
          }
          const sum = byManagerId[managerId].reduce(
            (acc: number, cur) => (acc += cur.dialogsCount),
            0
          );
          const mean = Math.floor(sum / byManagerId[managerId].length);
          g.push(mean);
          return g;
        }, [] as number[]);

        const dialogSeries = {
          name: 'Диалоги',
          type: 'bar',
          data: dialogValues,
        } satisfies BarSeriesOption;

        const messagesValues = Object.keys(byManagerId).reduce(
          (g, managerId) => {
            if (!byManagerId[managerId].length) {
              g.push(0);
              return g;
            }
            const sum = byManagerId[managerId].reduce(
              (acc: number, cur) => (acc += cur.messagesCount),
              0
            );
            const mean = Math.floor(sum / byManagerId[managerId].length);
            g.push(mean);
            return g;
          },
          [] as number[]
        );

        const messagesSeries = {
          name: 'Сообщения',
          type: 'bar',
          data: messagesValues,
        } satisfies BarSeriesOption;
        //   (managerId) =>
        //     ({
        //       name: 'Сообщения',
        //       type: 'bar',
        //       data: byManagerId[managerId].map((d) => d.messagesCount),
        //     } satisfies BarSeriesOption)
        // );

        (this.options.series as any) = [dialogSeries, messagesSeries];
        (this.options.xAxis as any)[0].data = Object.keys(
          this.managerNames
        ).map((managerId) => getFio(this.managerNames[managerId]));

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
