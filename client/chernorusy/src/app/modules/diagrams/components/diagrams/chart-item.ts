import { Observable, Subject } from 'rxjs';

export const panelRemovedSymb = Symbol('panelRemoved$');
export const dateRangeChangesSymb = Symbol('dateRangeChanges$');
export const headerButtonsSymb = Symbol('headerButtons$');
export const panelResizedSymb = Symbol('panelResized$');

export abstract class ChartItem {
  [dateRangeChangesSymb]!: Observable<[from: Date, to: Date]>;
  [headerButtonsSymb] = new Subject();
  [panelRemovedSymb]!: Subject<void>;
  [panelResizedSymb]!: Observable<{ foolscreen?: boolean } | void>;
  get dateRangeChanges$() {
    return this[dateRangeChangesSymb];
  }
  get headerButtons() {
    return this[headerButtonsSymb];
  }
  get panelRemoved$() {
    return this[panelRemovedSymb];
  }
  get panelResized$() {
    return this[panelResizedSymb];
  }
}
