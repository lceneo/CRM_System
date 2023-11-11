import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ILoginRequestDTO} from "../../../../shared/models/DTO/request/LoginRequestDTO";
import {AccountRole} from "../../../../shared/models/enums/AccountRole";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {IRegistrationRequestDTO} from "../../../../shared/models/DTO/request/RegistrationRequestDTO";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationComponent {

  protected form = new FormGroup({
    login: new FormControl<string>(''),
    email: new FormControl<string>(''),
    role: new FormControl<AccountRole>(1)
  });

  constructor(
      private authorizationS: AuthorizationService
    ) {
  }

  submitForm() {
    //@ts-ignore
    this.authorizationS.registrate$({...this.form.value, role: +this.form.value.role} as IRegistrationRequestDTO)
      .subscribe();
  }

  protected readonly AccountRole = AccountRole;
}
