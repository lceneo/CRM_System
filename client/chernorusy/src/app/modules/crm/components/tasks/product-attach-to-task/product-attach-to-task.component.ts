import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef, ElementRef, EventEmitter,
  Input,
  OnInit, Output,
  signal,
  Signal,
  ViewChild
} from '@angular/core';
import {ITask} from "../../../helpers/entities/ITask";
import {TaskService} from "../../../services/task.service";
import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {IProduct} from "../../../helpers/entities/IProduct";
import {ProductService} from "../../../services/product.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {map} from "rxjs";
import {MatSelectChange} from "@angular/material/select";
import {DatatableComponent} from "@swimlane/ngx-datatable";

@Component({
  selector: 'app-product-attach-to-task',
  templateUrl: './product-attach-to-task.component.html',
  styleUrls: ['./product-attach-to-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductAttachToTaskComponent implements OnInit {

  constructor(
    private taskS: TaskService,
    private productS: ProductService,
    private destroyRef: DestroyRef
  ) {}

  @Input({required: true}) set modeInfo(value: IProductAttachToTask) {
    this.mode = value.mode;
    if (value.mode === 'edit') { this.task = this.taskS.getByID(value.taskId!); }
  }

  @Output() selectedProductsChange = new EventEmitter<string[]>();

  protected mode?: 'create' | 'edit';
  protected task?: ITask;
  protected allProducts = this.productS.getEntitiesAsync();
  protected selectedProductsIDFormArray = new FormArray<AbstractControl<string>>([]);
  protected selectedProductsList: Signal<Array<Omit<IProduct, "taskIds">>> = signal([]);

  ngOnInit(): void {
    this.setupProductsFormArray();
  }

  protected selectProduct(selectEvent: MatSelectChange) {
    this.selectedProductsIDFormArray.clear();
    const productsIds: string[] = selectEvent.value;
    productsIds
      .map(id => new FormControl<string>(id) as FormControl<string>)
      .forEach(control => this.selectedProductsIDFormArray.push(control));

    this.selectedProductsChange.emit(selectEvent.value);
  }

  private setupProductsFormArray() {
    if (this.mode === 'edit') {
      this.task!.products
        .map(product => new FormControl<string>(product.id) as FormControl<string>)
        .forEach(control => this.selectedProductsIDFormArray.push(control));
    }

    this.selectedProductsIDFormArray.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(selectedIDs => selectedIDs.map(id => this.productS.getByID(id)) as IProduct[])
        //@ts-ignore
      ).subscribe(selectedProducts => this.selectedProductsList.set(selectedProducts))
  };
}


export interface IProductAttachToTask {
  mode: 'create' | 'edit';
  taskId?: string;
}
