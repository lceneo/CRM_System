import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
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

  @Input() mode: 'admin' | 'user' = 'admin';

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
    const credentials: IRegistrationRequestDTO = {...this.form.value, role: +this.form.value.role};
    if (this.mode === 'user') { delete credentials.role; }
    this.authorizationS.registrate$(credentials, this.mode).subscribe();
  }

  protected readonly AccountRole = AccountRole;
}
