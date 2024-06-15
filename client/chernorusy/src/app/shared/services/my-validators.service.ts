import { Injectable } from '@angular/core';
import {AbstractControl} from "@angular/forms";
import {ProductService} from "../../modules/crm/services/product.service";

@Injectable({
  providedIn: 'root'
})
export class MyValidatorsService {

  constructor(
    private productS: ProductService
  ) { }

  public minMaxLengthValidator(minLength: number, maxLength: number) {
    return (control: AbstractControl) => {
      const controlValueLength = control.value.trim().length;
      return controlValueLength >= minLength && controlValueLength <= maxLength ? null : {
        minMaxLengthValidator: {
          minLength,
          maxLength,
          actual: controlValueLength
        }
      }
    }
  }

  public onlyLatinSymbolsAndDigits(control: AbstractControl) {
    return /^[a-zA-Z0-9]+$/.test(control.value) ? null : { onlyLatinSymbolsAndDigits: true };
  }

  public passwordValidator(control: AbstractControl) { //один нижний символ, один верхний, 1 цифра
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/.test(control.value) ? null : { passwordValidator: true };
  }

  public emailValidator(control: AbstractControl) {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]+$/.test(control.value) ? null : { emailValidator: true };
  }

  public onlyLetters(control: AbstractControl) {
    return /^[а-яА-ЯёЁa-zA-Z]+$/.test(control.value) ? null : { onlyLetters: true };
  }

  public uniqueProductName(productInfo: UniqueProductNameSettingsType) {
    const products = (productInfo.type === 'edit' ?
      this.productS.getEntitiesSync().filter(p => p.id !== productInfo.editId) :
      this.productS.getEntitiesSync());

    return (control: AbstractControl) => {
      return products
        .find(p => p.description === control.value) ? { 'uniqueProductName': true } : null;
    }

  }
}

export type UniqueProductNameSettingsType = {
  type: 'create' | 'edit';
  editId?: string;
}
