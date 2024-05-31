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
import { ECharts, EChartsOption, PieSeriesOption } from 'echarts';
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
  selector: 'app-received-dialogs-overall-pie',
  templateUrl: './received-dialogs-overall.component.html',
  styleUrls: ['./received-dialogs-overall.component.scss'],
})
@ChartDashboardItem('Кол-во диалогов по менеджерам', 'received-dialogs-overall')
export class ReceivedDialogsOverallComponent extends ChartItem {
  @ViewChildren('managerChoseBtn') managerChoseBtn!: TemplateRef<any>;

  instance: ECharts | null = null;
  setInstance(ev: any) {
    console.log('setInstance', ev);
    this.instance = ev;
  }

  options: EChartsOption = {
    // grid: {
    //   bottom: 20,
    //   right: 20,
    // },
    legend: {
      type: 'scroll',
      show: true,
      textStyle: {
        color: '#AAAAAA',
      },
      right: 10,
      top: 20,
      bottom: 20,
    },
    // xAxis: [
    //   {
    //     type: 'time',
    //     min: 'dataMin',
    //     max: 'dataMax',
    //     axisLabel: {
    //       showMinLabel: true,
    //       showMaxLabel: true,
    //       hideOverlap: true,
    //     },
    //     splitLine: { show: false },
    //   },
    // ],
    // yAxis: [
    //   {
    //     type: 'value',
    //     minInterval: 1,
    //   },
    // ],
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
    // dataZoom: [{ type: 'inside', filterMode: 'filter' }],
  };

  private tooltipFormatter(params: any) {
    const { value, name } = params.data;
    return `<b>${name}</b><br> диалогов: ${value}`;
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
        }, {} as { [managerId: string]: { date: string; dialogsCount: number }[] });

        Object.keys(byManagerId).forEach((managerId) => {
          const stats = byManagerId[managerId];
          const groupedByDayDialogsCount = stats.reduce((grouped, cur) => {
            const date = new Date(cur.date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            const dayStr = `${year}::${month}::${day}`;
            if (!grouped[dayStr]) {
              grouped[dayStr] = [];
            }
            grouped[dayStr].push(cur.dialogsCount);
            return grouped;
          }, {} as Record<string, number[]>);
          const finalData = Object.keys(groupedByDayDialogsCount)
            .map((dateString) => {
              const counts = groupedByDayDialogsCount[dateString];
              const countsSum = counts.reduce((acc, cur) => (acc += cur), 0);
              const meanCount = Math.ceil(countsSum / counts.length);
              const [year, month, day] = dateString.split('::').map(Number);
              const date = new Date(year, month, day, 0, 0, 0, 0).toISOString();
              return { date, dialogsCount: meanCount };
            })
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          byManagerId[managerId] = finalData;
        });

        const values = Object.keys(byManagerId).map<PieSeriesOption>(
          (managerId) => {
            const meanCount =
              byManagerId[managerId].length === 0
                ? 0
                : Math.floor(
                    byManagerId[managerId].reduce(
                      (acc, cur) => (acc += cur.dialogsCount),
                      0
                    ) / byManagerId[managerId].length
                  );
            console.log(
              'meanCount',
              meanCount,
              managerId,
              byManagerId[managerId]
            );

            console.log(
              getFio(this.managerNames[managerId]),
              this.managerNames[managerId]
            );
            // value: d.dialogsCount,
            // ['name']: getFio(this.managerNames[managerId]),
            return {
              value: meanCount,
              name: getFio(this.managerNames[managerId]),
            };
          }
        );

        console.log('values', values);

        (this.options.series as any) = {
          type: 'pie',
          radius: '55%',
          center: ['40%', '50%'],
          data: values,
          label: {
            formatter: '{c}',
            position: 'inside',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        };
        const legend = this.options.legend as any;
        if (legend) {
          const managersLegend = Object.keys(this.managerNames).map(
            (managerId) => {
              console.log(
                getFio(this.managerNames[managerId]),
                this.managerNames[managerId]
              );
              return getFio(this.managerNames[managerId]);
            }
          );
          legend.data = managersLegend;
        }
        console.log('beforeUpdateOptions');
        this.updateOptions();
        console.log(this.options);
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
    console.log('deselected', deselectedManagers);
    deselectedManagers.deselectedManagers.forEach((managerId: string) =>
      this.deselectedManagers$.value.add(managerId)
    );
    this.deselectedManagers$.next(this.deselectedManagers$.value);
  }

  updateOptions() {
    if (this.instance) {
      console.log('current options', this.options);
      this.instance.setOption(this.options, true);
      console.log('options updated');
    } else {
      setTimeout(() => this.updateOptions());
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getData$(dateFrom: Date, dateTo: Date) {
    console.log('getData$', dateFrom, dateTo);
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
