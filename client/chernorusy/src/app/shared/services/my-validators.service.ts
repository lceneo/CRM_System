import { Injectable } from '@angular/core';
import {AbstractControl} from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class MyValidatorsService {

  constructor() { }

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
}
