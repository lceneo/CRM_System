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

@Component({
  selector: 'app-component-load',
  templateUrl: './component-load.component.html',
  styleUrls: ['./component-load.component.scss'],
})
export class ComponentLoadComponent implements AfterViewInit {
  @Input() dashboardItem!: GridsterItem;
  @Input() headerGridsterItem!: TemplateRef<any>;
  preload = true;

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
    (createdComponent.instance as any)['dateRangeChanges$'] =
      this.dashboardItem['dateRangeChanges$'];
    createdComponent.changeDetectorRef.detectChanges();
  }
}
