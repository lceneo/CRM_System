import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {tap} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {IChangePasswordRequestDTO} from "../../../../shared/models/DTO/request/ChangePasswordRequstDTO";

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetPasswordComponent {

  @Input({required: true}) userID!: string;
  @Input() mode: 'create' | 'change' = 'change';

  @Output() passwordSet$ = new EventEmitter<boolean>();

  protected password = "";

  protected changePasswordForm = new FormGroup({
    oldPassword: new FormControl(''),
    newPassword: new FormControl(''),
  })

  constructor(
    private authorizationS: AuthorizationService,
  ) {}

  protected setPassword() {
    if (this.mode === 'create') {
      this.authorizationS.createPassword(this.userID, {password: this.password})
        .pipe(
          tap(() => this.passwordSet$.emit(true))
        )
        .subscribe();
    } else {
      this.authorizationS.changePassword(this.changePasswordForm.value as IChangePasswordRequestDTO).subscribe();
    }
  }
}
