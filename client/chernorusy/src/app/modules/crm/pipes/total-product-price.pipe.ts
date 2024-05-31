import { Pipe, PipeTransform } from '@angular/core';
import {IProduct} from "../helpers/entities/IProduct";

@Pipe({
  name: 'totalProductPrice',
  standalone: true
})
export class TotalProductPricePipe implements PipeTransform {

  transform(products: Omit<IProduct, "taskIds">[]): number {
    return products
      .reduce((acc, product) => acc += product.price, 0);
  }
}
