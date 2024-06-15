import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ValidationErrors} from "@angular/forms";
import {BehaviorSubject, startWith, Subject} from "rxjs";
import {MatInputModule} from "@angular/material/input";
import {MatTooltipModule} from "@angular/material/tooltip";
import {NgLetDirective} from "../../directives/ng-let.directive";

@Component({
  selector: 'app-error-validation',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatTooltipModule, NgLetDirective],
  templateUrl: './error-validation.component.html',
  styleUrls: ['./error-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorValidationComponent {
  @Input()
  public set errors(error: ValidationErrors | null | undefined) {
    if(this.previousErrors && JSON.stringify(this.previousErrors) ===  JSON.stringify(error)) {
      return;
    }
    this.previousErrors = error;
    this.updateErrors(error);
  };

  protected errMsg$ = new BehaviorSubject<string>('');

  private previousErrors?: ValidationErrors | Error | null;

  private updateErrors(error: ValidationErrors | undefined | null) {

    if (!error)
      return;

    const errorsArr: string[] = [];
    const errorsObj = error as ValidationErrors;
    for (const err in errorsObj) {
      switch (err) {
        case "required":
          errorsArr.push("Обязательное поле");
          break;
        case "minlength":
        case "maxlength":
          errorsArr.push(`${err.includes('max') ? 'Максимальная' : 'Минимальная'} длина — ${errorsObj[err].requiredLength} cимволов`);
          break;
        case 'minMaxLengthValidator': {
          errorsArr.push(`Длина должна составлять от ${errorsObj[err].minLength} до ${errorsObj[err].maxLength} cимволов`);
          break;
        }
        case "emailValidator" :
          errorsArr.push("Некорректный формат email");
          break;
        case 'onlyLatinSymbolsAndDigits':
          errorsArr.push(`Разрешены только цифры и латинские символы`);
          break;
        case 'passwordValidator':
          errorsArr.push(`Пароль должен содержать численные символы, символы верхнего и нижнего регистров`);
          break;
        case 'onlyLetters':
          errorsArr.push('Разрешены только буквенные символы');
          break;
        case 'uniqueProductName':
          errorsArr.push('Продукт с таким именем уже существует');
          break;
      }
    }

    this.errMsg$.next(errorsArr.join('. '));
  }
}
