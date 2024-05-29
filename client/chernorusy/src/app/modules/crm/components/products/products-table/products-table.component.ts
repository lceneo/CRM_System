import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ProductService} from "../../../services/product.service";
import {MatDialog} from "@angular/material/dialog";
import {ModalCreateUpdateProductComponent} from "../modal-create-update-product/modal-create-update-product.component";
import {ModalDeleteProductComponent} from "../modal-delete-product/modal-delete-product.component";

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsTableComponent {
  constructor(
    private productS: ProductService,
    private matDialog: MatDialog
  ) {}

  protected products = this.productS.getEntitiesAsync();

  openCreateProductModal() {
    this.matDialog.open(ModalCreateUpdateProductComponent, {
      data: { mode: 'create' },
      autoFocus: false
    });
  }

  openUpdateProductModal(productId: string) {
    this.matDialog.open(ModalCreateUpdateProductComponent, {
      data: { mode: 'edit', productId },
      autoFocus: false
    });
  }

  openDeleteProductModal(productId: string) {
    this.matDialog.open(ModalDeleteProductComponent, {data: productId, autoFocus: false});
  }
}
