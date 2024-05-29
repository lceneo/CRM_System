import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ProductService} from "../../../services/product.service";
import {IProductCreateOrUpdateDTO} from "../../../helpers/DTO/request/IProductCreateOrUpdateDTO";
import {Observable, tap} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IProduct} from "../../../helpers/entities/IProduct";

@Component({
  selector: 'app-modal-create-update-product',
  templateUrl: './modal-create-update-product.component.html',
  styleUrls: ['./modal-create-update-product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalCreateUpdateProductComponent implements OnInit{

  constructor(
    private productS: ProductService,
    private matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected productData: IProductCreateOrUpdateModal
  ) {}

  protected formGroup = new FormGroup({
    price: new FormControl<number>(10, [Validators.required]),
    description: new FormControl<string>('', Validators.required)
  })

  protected header?: string;
  protected btnSubmitText?: string;

  ngOnInit() {
    this.setHeaderAndBtnSubmitText(this.productData);
    if (this.productData.mode === 'edit') { this.setInitialFormValue(this.productData.productId!); }
  }

  createOrUpdateProduct() {
    let obs: Observable<any>;
    if (this.productData.mode === 'create') {
      obs = this.productS.createHTTP$(this.formGroup.value as Omit<IProductCreateOrUpdateDTO, "id">)
    } else {
      obs = this.productS.updateHTTP$({
        id: this.productData.productId,
        ...this.formGroup.value as Omit<IProductCreateOrUpdateDTO, "id">
      });
    }
    obs
      .pipe(
        tap(() => this.matDialogRef.close())
    ).subscribe();
  }

  private setHeaderAndBtnSubmitText(modalData: IProductCreateOrUpdateModal) {
    if (modalData.mode === 'edit') {
      this.header = 'Изменить продукт';
      this.btnSubmitText = 'Сохранить';
    } else {
      this.header = 'Новый продукт';
      this.btnSubmitText = 'Создать'
    }
  }

  private setInitialFormValue(productId: string) {
    const product = this.productS.getByID(productId) as IProduct;
    this.formGroup.setValue({price: product.price, description: product.description}, {emitEvent: false})
  }
}

export interface IProductCreateOrUpdateModal {
  productId?: string;
  mode: 'edit' | 'create';
}
