import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ProductService} from "../../../services/product.service";

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsTableComponent {
  constructor(
    private productS: ProductService
  ) {}

  protected products = this.productS.getEntitiesAsync();
}
