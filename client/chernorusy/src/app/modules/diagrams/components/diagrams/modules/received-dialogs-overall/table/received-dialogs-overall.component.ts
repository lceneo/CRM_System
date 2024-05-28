import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ChartDashboardItem } from '../../../charts';
import { DatePipe } from '@angular/common';
import {
  BehaviorSubject,
  combineLatestWith,
  fromEvent,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ProfileService } from 'src/app/shared/services/profile.service';
import {
  GetActivityStatsResponse,
  StatisticsService,
} from 'src/app/shared/services/statistics.service';
import { AccountRole } from 'src/app/modules/profile/enums/AccountRole';
import { splitByDays } from 'src/app/shared/helpers/date';
import {
  ColumnMode,
  DatatableComponent,
  TableColumn,
} from '@swimlane/ngx-datatable';
import {
  ChartItem,
  dateRangeChangesSymb,
  headerButtonsSymb,
  panelRemovedSymb,
} from '../../../chart-item';
import { IProfileResponseDTO } from 'src/app/modules/profile/DTO/response/ProfileResponseDTO';

@Component({
  selector: 'app-received-dialogs-overall-table',
  templateUrl: './received-dialogs-overall.component.html',
  styleUrls: ['./received-dialogs-overall.component.scss'],
})
@ChartDashboardItem('Кол-во диалогов по менеджерам', 'received-dialogs-overall')
export class ReceivedDialogsOverallComponent extends ChartItem {
  @ViewChildren('managerChoseBtn') managerChoseBtn!: TemplateRef<any>;

  @ViewChild('managerTmpl', { static: true }) managerTmpl!: TemplateRef<any>;
  @ViewChild('textTmpl', { static: true }) textTmpl!: TemplateRef<any>;
  @ViewChild('countTmpl', { static: true }) countTmpl!: TemplateRef<any>;
  @ViewChild('dateHeaderTmpl', { static: true })
  dateHeaderTmpl!: TemplateRef<any>;

  @ViewChild('table') table!: DatatableComponent;

  destroy$ = new Subject<void>();

  constructor(
    private statisticsS: StatisticsService,
    private profileS: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  load$ = new BehaviorSubject<boolean>(true);

  managerNames: { [managerId: string]: { name: string; surname: string } } = {};
  managers$ = this.profileS.getProfiles$({ Role: AccountRole.Manager }).pipe(
    map((resp) => resp.items),
    shareReplay()
  );
  deselectedManagers$ = new BehaviorSubject(new Set<string>());
  rows: { managerId: string; [dateString: string]: string }[] = [];
  columns: TableColumn[] = [];
  dates: Date[] = [];

  changeSelection(manager: IProfileResponseDTO, selected: boolean) {
    if (selected) {
      this.deselectedManagers$.value.delete(manager.id);
    } else {
      this.deselectedManagers$.value.add(manager.id);
    }
  }

  ngOnInit() {
    this[dateRangeChangesSymb]
      .pipe(
        takeUntil(this.destroy$),
        switchMap((dateRange) => this.getData$(...dateRange)),
        combineLatestWith(this.deselectedManagers$),
        map(([data, deselected]) => {
          const names = {} as any;
          const dataFiltered = {} as typeof data.data;
          Object.keys(data.names)
            .filter((managerId) => !deselected.has(managerId))
            .forEach((managerId) => {
              names[managerId] = data.names[managerId];
              dataFiltered[managerId] = data.data[managerId];
            });
          return {
            data: dataFiltered,
            names,
          };
        })
      )
      .subscribe(({ data, names }) => {
        this.managerNames = names;
        this.data = data;
        this.setColumns();
        this.setRows();
        console.log(
          'table rows',
          this.rows,
          this.dates.map((d) => d.toISOString())
        );
        this.cdr.detectChanges();
      });
  }

  data = {} as {
    [managerId: string]: {
      date: Date;
      dialogsCount: number | null;
      messagesCount: number | null;
    }[];
  };

  ngAfterViewInit() {
    this[headerButtonsSymb].next(this.managerChoseBtn);

    merge(fromEvent(window, 'beforeunload'), this[panelRemovedSymb]).subscribe(
      () => {
        const deselectedManagers = [...this.deselectedManagers$.value];
        localStorage.setItem(
          'app-received-dialogs-overall-table',
          JSON.stringify({ deselectedManagers })
        );
      }
    );
    const deselectedManagers = JSON.parse(
      localStorage.getItem('app-received-dialogs-overall-table') ??
        '{deselectedManagers: []}'
    );
    console.log('deselected', deselectedManagers);
    deselectedManagers.deselectedManagers.forEach((managerId: string) =>
      this.deselectedManagers$.value.add(managerId)
    );
    this.deselectedManagers$.next(this.deselectedManagers$.value);

    this.panelResized$.subscribe(() => {
      console.log('size updated');
      this.table.recalculate();
    });
  }

  private setRows() {
    this.rows = Object.keys(this.managerNames).map((managerId) => {
      const row: (typeof this.rows)[0] = {
        managerId,
      };
      this.dates.forEach(
        (date) => (row[date.toISOString()] = date.toISOString())
      );
      return row;
    });
  }

  private setColumns() {
    this.columns = [
      {
        prop: 'managerId',
        name: 'Менеджер',
        cellTemplate: this.managerTmpl,
        headerTemplate: this.textTmpl,
        width: 250,
      },
    ];
    this.dates.forEach((date) =>
      this.columns.push({
        prop: date.getTime(),
        name: date.toISOString(),
        cellTemplate: this.countTmpl,
        headerTemplate: this.dateHeaderTmpl,
      })
    );
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
      map((resp) =>
        resp.reduce((byManagerId, cur) => {
          if (!byManagerId[cur.managerId]) {
            byManagerId[cur.managerId] = [];
          }
          byManagerId[cur.managerId].push(...cur.dailyStat);
          return byManagerId;
        }, {} as { [managerId: string]: GetActivityStatsResponse['dailyStat'] })
      ),
      map((statByManagerId) => {
        return Object.keys(statByManagerId).reduce((byManagerId, managerId) => {
          const stat = statByManagerId[managerId];
          byManagerId[managerId] = stat.reduce((grouped, cur) => {
            const d = new Date(
              new Date(cur.date).setHours(0, 0, 0, 0)
            ).toISOString();
            if (!grouped[d]) {
              grouped[d] = [];
            }
            grouped[d].push(cur);
            return grouped;
          }, {} as { [dateString: string]: GetActivityStatsResponse['dailyStat'] });
          return byManagerId;
        }, {} as { [managerId: string]: { [dateString: string]: GetActivityStatsResponse['dailyStat'] } });
      }),
      map((grouped) => {
        this.dates = splitByDays(dateFrom, dateTo);
        this.dateIndexes = {};
        this.dates.forEach(
          (date, index) => (this.dateIndexes[date.toISOString()] = index)
        );
        return Object.keys(grouped).reduce((groupedFull, managerId) => {
          groupedFull[managerId] = this.dates.map((date) => {
            const dateString = date.toISOString();
            if (!grouped[managerId][dateString]) {
              return { date, dialogsCount: null, messagesCount: null };
            }
            const data = grouped[managerId][dateString];
            const dialogsCount = Math.floor(
              data.reduce((acc, cur) => (acc += cur.dialogsCount), 0) /
                data.length
            );
            const messagesCount = Math.floor(
              data.reduce((acc, cur) => (acc += cur.messagesCount), 0) /
                data.length
            );
            return { date, dialogsCount, messagesCount };
          });
          return groupedFull;
        }, {} as { [managerId: string]: { date: Date; dialogsCount: number | null; messagesCount: number | null }[] });
      }),
      map((stats) => ({ data: stats, names })),
      tap(() => this.load$.next(false))
    );
  }

  dateIndexes = {} as { [dateString: string]: number };

  protected readonly ColumnMode = ColumnMode;
}
