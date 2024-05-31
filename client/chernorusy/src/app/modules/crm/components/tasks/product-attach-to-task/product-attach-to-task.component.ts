import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,  EventEmitter,
  Input,
  OnInit, Output,
  signal,
  Signal,
} from '@angular/core';
import {ITask} from "../../../helpers/entities/ITask";
import {TaskService} from "../../../services/task.service";
import {FormControl} from "@angular/forms";
import {IProduct} from "../../../helpers/entities/IProduct";
import {ProductService} from "../../../services/product.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {map} from "rxjs";

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
    if (value.mode !== 'create') { this.task = this.taskS.getByID(value.taskId!); }
  }

  @Output() selectedProductsChange = new EventEmitter<string[]>();

  protected mode?: 'create' | 'edit' | 'view';
  protected task?: ITask;
  protected allProducts = this.productS.getEntitiesAsync();
  protected selectedProductsID = new FormControl<string[]>([]);
  protected selectedProductsList: Signal<Array<Omit<IProduct, "taskIds">>> = signal([]);

  ngOnInit(): void {
    this.setupProductsFormArray();
  }

  private setupProductsFormArray() {
    if (this.mode !== 'create') {
      this.selectedProductsID.setValue(
      this.task!.products
        .map(product => product.id)
      );
      //@ts-ignore
      this.selectedProductsList.set(this.task!.products);
    }

    this.selectedProductsID.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(selectedIDs => selectedIDs!.map(id => this.productS.getByID(id)) as IProduct[])
      ).subscribe(selectedProducts => {
      //@ts-ignore
        this.selectedProductsList.set(selectedProducts);
        this.selectedProductsChange.emit(selectedProducts.map(prod => prod.id));
      })
  };
}


export interface IProductAttachToTask {
  mode: 'create' | 'edit' | 'view';
  taskId?: string;
}
