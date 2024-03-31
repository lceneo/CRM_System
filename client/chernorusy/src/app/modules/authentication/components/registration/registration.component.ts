import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AccountRole} from "../../../profile/enums/AccountRole";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {IRegistrationRequestDTO} from "../../DTO/request/RegistrationRequestDTO";
import {MyValidatorsService} from "../../../../shared/services/my-validators.service";
import {Router} from "@angular/router";
import {tap} from "rxjs";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationComponent {

  @Input() mode: 'admin' | 'user' = 'admin';

  protected form = new FormGroup({
    login: new FormControl<string>('', [Validators.required, this.myValidatorS.minMaxLengthValidator(4, 15), this.myValidatorS.onlyLatinSymbolsAndDigits]),
    email: new FormControl<string>('', [Validators.required, this.myValidatorS.emailValidator]),
    role: new FormControl<AccountRole>(1, [Validators.required])
  });

  constructor(
      private authorizationS: AuthorizationService,
      private myValidatorS: MyValidatorsService,
      private router: Router
    ) {
  }

  submitForm() {
    //@ts-ignore
    const credentials: IRegistrationRequestDTO = {...this.form.value, role: +this.form.value.role};
    if (this.mode === 'user') { delete credentials.role; }
    this.authorizationS.registrate$(credentials, this.mode)
      .pipe(
        tap(() => {
          this.router.navigate(['success'], {
            state: {
              title: `Подтверждение email`,
              body: `Для завершения регистрации проверьте почту <b>${this.form.get('email')?.value}</b> и перейдите по ссылке указанной в письме для установления пароля.`,
              imgName: 'envelope.png',
              innerHtml: true
            }
          });
        })
      )
      .subscribe();
  }

  protected readonly AccountRole = AccountRole;
}
