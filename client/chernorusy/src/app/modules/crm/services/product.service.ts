import { Injectable } from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IProduct} from "../helpers/entities/IProduct";
import {ICreateOrUpdateEntityDTO} from "../../../shared/helpers/DTO/response/ICreateOrUpdateEntityDTO";
import {map, switchMap, tap} from "rxjs";
import {IProductCreateOrUpdateDTO} from "../helpers/DTO/request/IProductCreateOrUpdateDTO";

@Injectable({
  providedIn: 'root'
})
export class ProductService extends EntityStateManager<IProduct>{

  constructor() {
    super();
    this.initial();
  }

  protected override initMethod = '/Products/Search';
  override httpInitMethod: 'get' | 'post' = 'post';
  override httpInitBody = {};
  override mapFn = (productItems: {items: IProduct[]}) => productItems.items.map(product =>  {
    let description = product.description;
    if (description.includes('\n')) { description = description.trim(); }
    return {...product, description: description}
  });

  protected override initial() {
    this.initStore();
    this.registrateSocketHandlers();
  }

  createHTTP$(product: Omit<IProductCreateOrUpdateDTO, 'id'>) {
    return this.httpS.post<{id: string}>('/Products', product)
      .pipe(
        switchMap((res) => this.getByIDHttp$(res.id)),
        tap((product) => {
          this.upsertEntities([product]);
        })
      );
  }

  updateHTTP$(updatedProduct: Partial<IProductCreateOrUpdateDTO>) {
    return this.httpS.post<ICreateOrUpdateEntityDTO>('/Products', updatedProduct)
      .pipe(
        switchMap((res) => this.getByIDHttp$(res.id)),
        tap((updatedProduct) => this.updateByID(updatedProduct.id, updatedProduct))
      );
  }

  deleteByIDHTTP$(productID: string) {
    return this.httpS.delete(`/Products/${productID}`)
      .pipe(
        tap(res => {
          this.removeByID(productID);
        })
      );
  }

  getByIDHttp$(productID: string) {
    return this.httpS.post<{items: IProduct[]}>(this.initMethod, { ids: [productID]})
      .pipe(
        map(res => this.mapFn(res)[0])
      );
  }
  private registrateSocketHandlers() {

  }
}
