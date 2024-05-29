import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {ProductService} from "../../../services/product.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {tap} from "rxjs";

@Component({
  selector: 'app-modal-delete-product',
  templateUrl: './modal-delete-product.component.html',
  styleUrls: ['./modal-delete-product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDeleteProductComponent {

  constructor(
    private productS: ProductService,
    private matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected productId: string,
  ) {
  }
  deleteProduct() {
    this.productS.deleteByIDHTTP$(this.productId)
      .pipe(
        tap(() => this.matDialogRef.close())
      )
      .subscribe();
  }
}
