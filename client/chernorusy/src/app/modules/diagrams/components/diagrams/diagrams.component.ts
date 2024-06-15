import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridType,
} from 'angular-gridster2';
import {
  filter,
  fromEvent,
  isObservable,
  map,
  merge,
  Observable,
  shareReplay,
  startWith,
  Subject,
} from 'rxjs';
import { charts } from './charts';
import { dateRangeChangesSymb, panelResizedSymb } from './chart-item';
import { MatMenu } from '@angular/material/menu';
import { panelRemovedSymb } from './chart-item';

@Component({
  selector: 'app-diagrams',
  templateUrl: 'diagrams.component.html',
  styleUrls: ['diagrams.component.scss'],
})
export class DiagramsComponent implements OnDestroy {
  @ViewChild('gridster') gridster!: GridsterComponent;
  @ViewChild('chartsMenu') menu!: MatMenu;

  destroy$ = new Subject<void>();

  options: GridsterConfig = {
    pushItems: true, // whether to push other items out of the way
    floating: true,
    margins: [10, 10],
    gridType: GridType.ScrollVertical,
    allowMultiLayer: true,
    defaultLayerIndex: 1,
    baseLayerIndex: 2,
    maxLayerIndex: 2,
    disableAutoPositionOnConflict: false,
    resizable: {
      enabled: true,
    },
    disableScrollHorizontal: true,
    disableScrollVertical: true,
    compactType: 'none',
    displayGrid: 'none',
    minCols: window.screen.width / 350, //вычисляем размер колонки
    minRows: 1,
    maxCols: 100,
    maxRows: 100,
    defaultItemCols: 2,
    defaultItemRows: 2,
    maxItemCols: 100,
    maxItemRows: 100,
    maxItemArea: 10000,
    minItemRows: 1,
    minItemCols: 1,
    itemResizeCallback: (item, itemComponent) => {
      item[panelResizedSymb as any].next();
    },
    draggable: {
      enabled: true,
      dragHandleClass: 'itemGridster__header_drag',
      ignoreContent: true,
    },
  };

  dashboard: GridsterItem[] = [
    {
      cols: 1,
      rows: 1,
      y: 0,
      x: 0,
      title: 'Некий чарт',
      resizeEnabled: true,
    },
  ];

  ngAfterViewInit() {}

  addChart(id: number) {
    const item: GridsterItem = {
      chartId: id,
      cols: 2,
      rows: 1,
      x: 0,
      y: 0,
      [dateRangeChangesSymb]: this.dateRangeChanges$,
      [panelRemovedSymb]: new Subject<void>(),
      [panelResizedSymb]: new Subject<{ fullscreen?: boolean } | void>(),
    };
    const foundSpace = this.gridster.getNextPossiblePosition(item);

    const fullscreenItem = this.dashboard.find(item => item.layerIndex === 2);
    if (fullscreenItem) { this.toggleFullscreen(null as any as MouseEvent, fullscreenItem); }

    if (foundSpace) {
      this.dashboard.push(item);
      this.cdr.detectChanges();
      return;
    }
    const { curHeight, el } = this.gridster;
    const rowHeight = curHeight / 33;

    el.style.setProperty('height', curHeight + rowHeight + 'px');
    this.gridster.getNextPossiblePosition(item);
    this.dashboard.push(item);
    this.cdr.detectChanges();
  }

  removeChart(ev: MouseEvent | TouchEvent, item: GridsterItem) {
    ev.preventDefault();
    ev.stopPropagation();
    this.dashboard = this.dashboard.filter((i) => i !== item);
    item[panelRemovedSymb as any].next();
    this.cdr.detectChanges();
  }

  curDateStartDay = new Date(new Date().setHours(0, 0, 0, 0));
  curDateEndDay = new Date(new Date().setHours(23, 59, 59, 59));

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.dateRangeChanges$.subscribe();
    try {
      this.dashboard = JSON.parse(
        localStorage.getItem('diagrams-dashboard') ?? '[]'
      );
    } catch {
      this.dashboard = [];
    }

    this.dashboard.forEach((item) => {
      item[dateRangeChangesSymb as any] = this.dateRangeChanges$;
      item[panelRemovedSymb as any] = new Subject<void>();
      item[panelResizedSymb as any] = new Subject<{
        fullscreen?: boolean;
      } | void>();
    });

    merge(fromEvent(window, 'beforeunload'), this.destroy$).subscribe(() =>
      this.saveDashboard()
    );
  }

  toggleFullscreen(ev: MouseEvent | TouchEvent, item: GridsterItem) {
    const toFullscreen = item.layerIndex !== 2;
    if (toFullscreen) {
      item.resizeEnabled = false;
      item.dragEnabled = false;
      item.layerIndex = 2;
      const { x, y, cols, rows } = item;
      item['prevPosition'] = {
        x,
        y,
        cols,
        rows,
      };
      item.x = 0;
      item.y = 0;
      item.cols = 100;
      item.rows = 100;
    } else {
      item.resizeEnabled = true;
      item.dragEnabled = true;
      item.layerIndex = 1;

      if (item['prevPosition']) {
        const { x, y, cols, rows } = item['prevPosition'];
        item.x = x;
        item.y = y;
        item.cols = cols;
        item.rows = rows;
      } else {
        this.gridster.getNextPossiblePosition(item);
      }
    }

    this.options?.api?.optionsChanged?.();
    setTimeout(
      () => item[panelResizedSymb as any]?.next({ fullscreen: toFullscreen }),
      250
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private saveDashboard() {
    const cleaerdDashboard = this.dashboard.map((obj) => {
      const cleared = {} as GridsterItem;
      Object.keys(obj)
        .filter((key) => !isObservable(obj[key]))
        .forEach((key) => (cleared[key] = obj[key]));
      return cleared;
    });
    localStorage.setItem(
      'diagrams-dashboard',
      JSON.stringify(cleaerdDashboard)
    );
  }

  dateForm = this.fb.group(
    {
      dateStart: [new Date(), Validators.required],
      timeStart: ['00:00'],
      dateEnd: [new Date(), Validators.required],
      timeEnd: ['23:59'],
    },
    { updateOn: 'blur' }
  );

  dateRangeChanges$: Observable<[from: Date, to: Date]> =
    this.dateForm.valueChanges.pipe(
      startWith(this.dateForm.value),

      filter((value) => !!value.dateEnd && !!value.dateStart),
      map((value) => {
        const [startH, startM] = (
          value.timeStart === '' ? '00:00' : value.timeStart!
        )
          .split(':')
          .map(Number);
        const [endH, endM] = (value.timeEnd === '' ? '23:59' : value.timeEnd!)
          .split(':')
          .map(Number);
        const startTimestamp = new Date(value.dateStart!).setHours(
          startH,
          startM,
          0,
          0
        );
        const endTimestamp = new Date(value.dateEnd!).setHours(
          endH,
          endM,
          59,
          59
        );
        return [new Date(startTimestamp), new Date(endTimestamp)] satisfies [
          from: Date,
          to: Date
        ];
      }),
      shareReplay()
    );

  charts = charts;
}
