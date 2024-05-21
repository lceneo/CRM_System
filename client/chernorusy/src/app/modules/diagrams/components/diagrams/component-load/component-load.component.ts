import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  createNgModule,
  Injector,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { GridsterItem } from 'angular-gridster2';
import { charts, ImportItem } from '../charts';
import { take } from 'rxjs';
import { panelRemovedSymb } from '../diagrams.component';

@Component({
  selector: 'app-component-load',
  templateUrl: './component-load.component.html',
  styleUrls: ['./component-load.component.scss'],
})
export class ComponentLoadComponent implements AfterViewInit {
  @Input() dashboardItem!: GridsterItem;
  @Input() headerGridsterItem!: TemplateRef<any>;
  preload = true;
  buttonTemplates: TemplateRef<any>[] = [];
  title: string = '...';

  constructor(
    private injector: Injector,
    private vcr: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    const item = charts.find((ch) => ch.title === this.dashboardItem['title']);
    console.log('gotItem', item, this.dashboardItem['title'], charts, !!item);
    if (!item) {
      throw new Error(
        `Couldn't find chart name ${this.dashboardItem['title']}`
      );
    }
    this.title = item.title;
    this.loadModule(item!)
      .catch(console.error)
      .finally(() => {
        console.log('did load component', this.vcr);
        this.preload = false;
        this.cdr.detectChanges();
      });
  }

  async loadModule(item: ImportItem) {
    const importData = await item.import();
    const moduleName = Object.keys(importData)[0];
    const moduleRef = createNgModule(importData[moduleName], this.injector);
    const component = (moduleRef.instance as any)?.['getExternalComponent']?.();
    console.log('got component', component);
    if (!component) {
      console.error();
    }
    this.vcr.clear();
    const createdComponent = this.vcr.createComponent(component, {
      ngModuleRef: moduleRef,
    });
    console.log('createdComponent', createdComponent);
    (createdComponent.instance as any)[panelRemovedSymb] =
      this.dashboardItem[panelRemovedSymb as any];
    (createdComponent.instance as any)[dateRangeChangesSymb] =
      this.dashboardItem[dateRangeChangesSymb as any];
    console.log(this.dashboardItem);
    (createdComponent.instance as any)[headerButtonsSymb]
      ?.pipe(take(1))
      .subscribe((templates: any) => (this.buttonTemplates = templates));
    createdComponent.changeDetectorRef.detectChanges();
  }
}

export const dateRangeChangesSymb = Symbol('dateRangeChanges$');
export const headerButtonsSymb = Symbol('headerButtons$');
