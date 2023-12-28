import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {tap} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {IChangePasswordRequestDTO} from "../../../../shared/models/DTO/request/ChangePasswordRequstDTO";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MyValidatorsService} from "../../../../shared/services/my-validators.service";

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

  protected passwordControl = new FormControl("", [Validators.required,this.myValidatorS.minMaxLengthValidator(3, 15), this.myValidatorS.passwordValidator]);

  protected changePasswordForm = new FormGroup({
    oldPassword: new FormControl('',[Validators.required]),
    newPassword: new FormControl('', [Validators.required,this.myValidatorS.minMaxLengthValidator(3, 15), this.myValidatorS.passwordValidator]),
  })

  constructor(
    private authorizationS: AuthorizationService,
    private myValidatorS: MyValidatorsService,
    private snackBar: MatSnackBar
  ) {}

  protected setPassword() {
    if (this.mode === 'create') {
      this.authorizationS.createPassword(this.userID, {password: this.passwordControl.value!})
        .pipe(
          tap(() => this.passwordSet$.emit(true))
        )
        .subscribe();
    } else {
      this.authorizationS.changePassword(this.changePasswordForm.value as IChangePasswordRequestDTO)
        .pipe(
          tap(() => this.snackBar.open('Пароль успешно изменён', 'Закрыть', { duration: 1500 }))
        )
        .subscribe();
    }
  }

  protected changePasswordVisibility(passwordInput: HTMLInputElement) {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  }
}
