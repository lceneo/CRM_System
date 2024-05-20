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
import { filter, map, Observable, shareReplay, startWith, tap } from 'rxjs';
import { charts } from './charts';

@Component({
  selector: 'app-diagrams',
  templateUrl: 'diagrams.component.html',
  styleUrls: ['diagrams.component.scss'],
})
export class DiagramsComponent implements OnDestroy {
  @ViewChild('gridster') gridster!: GridsterComponent;

  options: GridsterConfig = {
    gridType: GridType.ScrollVertical,
    allowMultiLayer: true,
    defaultLayerIndex: 1,
    baseLayerIndex: 2,
    maxLayerIndex: 2,
    disableAutoPositionOnConflict: true,
    resizable: {
      enabled: true,
    },
    disableScrollHorizontal: true,
    disableScrollVertical: true,
    compactType: 'none',
    displayGrid: 'none',
    minCols: 10,
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

  addChart(title: string) {
    const item: GridsterItem = {
      title,
      cols: 1,
      rows: 1,
      x: 0,
      y: 0,
      dateRangeChanges$: this.dateRangeChanges$,
    };
    const foundSpace = this.gridster.getNextPossiblePosition(item);
    if (foundSpace) {
      this.dashboard.push(item);
      this.cdr.detectChanges();
      return;
    }
    const { curHeight, el } = this.gridster;
    const rowHeight = curHeight / 33;
    console.log(rowHeight, curHeight);
    el.style.setProperty('height', curHeight + rowHeight + 'px');
    this.gridster.getNextPossiblePosition(item);
    this.dashboard.push(item);
    this.cdr.detectChanges();
  }

  removeChart(ev: MouseEvent | TouchEvent, item: GridsterItem) {
    ev.preventDefault();
    ev.stopPropagation();
    this.dashboard = this.dashboard.filter((i) => i !== item);
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
  }

  ngOnDestroy() {
    localStorage.setItem('diagrams-dashboard', JSON.stringify(this.dashboard));
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
      tap((v) => console.log('start', v)),
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
      shareReplay(),
      tap((v) => console.log('end', v))
    );

  charts = charts;
}
