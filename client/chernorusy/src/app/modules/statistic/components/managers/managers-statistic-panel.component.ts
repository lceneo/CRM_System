import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {ProfileService} from "../../../../shared/services/profile.service";
import {FormControl, FormGroup} from "@angular/forms";
import {AccountRole} from "../../../profile/enums/AccountRole";
import {IProfileResponseDTO} from "../../../profile/DTO/response/ProfileResponseDTO";
import {
  BehaviorSubject,
  combineLatest, debounceTime,
  fromEvent,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  shareReplay,
  takeUntil,
  tap, throttleTime
} from "rxjs";
import {AllRatings, RatingService} from "../../../../shared/services/rating.service";
import {MatTableDataSource} from "@angular/material/table";
import {ColumnMode, DatatableComponent, TableColumn} from "@swimlane/ngx-datatable";
import {ChatSearchService} from "../../../../shared/services/chat-search.service";
import {ChatStatus} from "../../../chat/helpers/enums/ChatStatus";
import {StatisticComponent} from "../statistic/statistic.component";
import {StatisticsService} from "../../../../shared/services/statistics.service";

@Component({
  selector: 'app-managers-statistic-panel',
  templateUrl: 'managers-statistic-panel.component.html',
  styleUrls: ['managers-statistic-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagersStatisticPanelComponent implements OnDestroy, AfterViewInit {
  @ViewChild('idTempl', {static: true}) idTempl!: ElementRef;
  @ViewChild('ratingTempl', {static: true}) ratingTempl!: ElementRef;
  @ViewChild('ratingCountTempl', {static: true}) countTempl!: ElementRef;
  @ViewChild('chatCountTempl', {static: true}) chatCountTempl!: ElementRef;
  @ViewChild('ansTime', {static: true}) ansTime!: ElementRef;
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  private destroy = new Subject<void>();

  constructor(
    private profileS: ProfileService,
    private chatSearchS: ChatSearchService,
    private ratingS: RatingService,
    private host: ElementRef,
    private statS: StatisticsService,
  ) {
    profileS.getProfiles$({Role: AccountRole.Manager})
      .subscribe(resp => {
        this.managersAll$.next(resp.items);
        resp.items.forEach(manager =>
          this.chatSearchS.getForUser$(manager.id)
            .subscribe((data) => {
              const active = data.items.filter(chat => chat.status === ChatStatus.Active);
              const chatCounts = this.chatCounts$.value;
              chatCounts[manager.id] = { active: active.length, all: data.totalCount };
              this.chatCounts$.next(chatCounts);
            })
        )
        statS.getAverageAnswerTime$(resp.items.map(m => m.id), new Date().setHours(0,0,0,0), new Date().setHours(1,0,0,0))
          .subscribe();
        console.log('managers', resp.items);
      })
    this.allRatings$.subscribe(console.log);

    this.managers$.subscribe();
  }

  chatCounts$: BehaviorSubject<{[managerId: number | string]: {[s: string | number]: number, active: number, all: number}}> = new BehaviorSubject({});
  averageTimes$: BehaviorSubject<{[managerId: number | string]: number | null}> = new BehaviorSubject({});

  searchForm: SearchForm = new FormGroup({
    Ids: new FormControl<string[]>([]),
    StartTimestamp: new FormControl<Date | null>(null),
    EndTimestamp: new FormControl<Date | null>(null),
    Skip: new FormControl<number | null>(null),
    Take: new FormControl<number | null>(null)
  }) //TODO: сделать дату, время, выбор манагеров

  columns: TableColumn[] = [];

  ngAfterViewInit() {
    const col = (this.host.nativeElement as HTMLDivElement).offsetWidth / 6;
    this.columns = [
      { prop: 'id', cellTemplate: this.idTempl, width: col, name: 'Имя сотрудника', sortable: true },
      { prop: '0', cellTemplate: this.ratingTempl, width: col, flexGrow: 1, name: 'Рейтинг' },
      { prop: '1', cellTemplate: this.countTempl, width: col, flexGrow: 1, name: 'Кол-во оценок' },
      { prop: 'avgAnsTime', cellTemplate: this.ansTime, width: col, flexGrow: 1, name: 'Сред. время ответа' },
      { prop: 'all', cellTemplate: this.chatCountTempl, width: col, flexGrow: 1, name: 'Кол-во чатов' },
      { prop: 'active', cellTemplate: this.chatCountTempl, width: col, flexGrow: 1, name: 'Кол-во активных чатов' },
    ]

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy), throttleTime(100))
      .subscribe(() => {
        const col = (this.host.nativeElement as HTMLDivElement).offsetWidth / 6;
        this.columns.forEach((column) => column.width = col);
        this.table.recalculateColumns(this.columns); console.log('recalculated')
      });
  }

  managersAll$ = new BehaviorSubject<IProfileResponseDTO[]>([]);
  allRatings$: Observable<AllRatings> = this.managersAll$.pipe(
    map((managers) => managers.map(manager => manager.id)),
    switchMap((ids) => this.ratingS.getManyForce$(ids)),
    shareReplay(),
  )
  managers$: Observable<IProfileResponseDTO[]> = combineLatest([
    this.managersAll$,
    this.searchForm.controls.Ids.valueChanges.pipe(startWith([] as string[]))
  ])
    .pipe(
      takeUntil(this.destroy),
      map(([managers, selectedIds]) =>  {
        if (!selectedIds || !selectedIds.length) {
          return managers;
        }
        return managers.filter(manager => selectedIds.includes(manager.id))
      }),
      tap((managers) => {
        console.log('datasource.data = ', managers);
        console.log('columns', this.columns);
        console.log('idsTempl', this.idTempl);
      }),
      map(v => [...v ,...v])
    )

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  getName(manager: IProfileResponseDTO) {
    return [manager.surname, manager.name, manager.patronimic].filter(Boolean).join(' ');
  }

  protected readonly ColumnMode = ColumnMode;
}

type SearchForm = FormGroup<{
  Ids: FormControl<string[] | null>,
  StartTimestamp: FormControl<Date | null>,
  EndTimestamp: FormControl<Date | null>,
  Skip: FormControl<number | null>,
  Take: FormControl<number | null>
}>
