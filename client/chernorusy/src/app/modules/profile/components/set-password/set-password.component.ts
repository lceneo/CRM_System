import {ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {tap} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {IChangePasswordRequestDTO} from "../../../../shared/models/DTO/request/ChangePasswordRequstDTO";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MyValidatorsService} from "../../../../shared/services/my-validators.service";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetPasswordComponent implements OnInit {

  @Input({required: true}) userID!: string;
  @Input() mode: 'create' | 'change' | 'recover' = 'change';

  @Output() passwordSet$ = new EventEmitter<boolean>();

  protected passwordControl = new FormControl("", [Validators.required,this.myValidatorS.minMaxLengthValidator(3, 15), this.myValidatorS.passwordValidator]);
  protected userRecoverID?: string;

  protected changePasswordForm = new FormGroup({
    oldPassword: new FormControl('',[Validators.required]),
    newPassword: new FormControl('', [Validators.required,this.myValidatorS.minMaxLengthValidator(3, 15), this.myValidatorS.passwordValidator]),
  })


  constructor(
    private authorizationS: AuthorizationService,
    private myValidatorS: MyValidatorsService,
    private route: ActivatedRoute,
    private router: Router,
    private destroyRef: DestroyRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
        const modeInData = this.route.snapshot.data && 'mode' in this.route.snapshot.data;
        if (modeInData) { // @ts-ignore
          this.mode = this.route.snapshot.data.mode
        }

        if (this.mode === 'recover') {
          this.route.paramMap
            .pipe(
              takeUntilDestroyed(this.destroyRef)
            ).subscribe(params => this.userRecoverID = params.get('id') as string);
        }
    }

  protected setPassword() {
    if (this.mode === 'create') {
      this.authorizationS.createPassword(this.userID, {password: this.passwordControl.value!})
        .pipe(
          tap(() => this.passwordSet$.emit(true))
        )
        .subscribe();
    } else if (this.mode === 'change') {
      this.authorizationS.changePassword(this.changePasswordForm.value as IChangePasswordRequestDTO)
        .pipe(
          tap(() => {
            this.snackBar.open('Пароль успешно изменён', 'Закрыть', { duration: 1500 });
            this.router.navigate(['main']);
          })
        )
        .subscribe();
    } else {
      this.authorizationS.recoverPasswordToUser(this.userRecoverID!, {password: this.passwordControl.value!})
        .pipe(
          tap(() => {
            this.snackBar.open('Пароль успешно изменён', 'Закрыть', { duration: 1500 });
            this.router.navigate(['main']);
          })
        )
        .subscribe();
    }
  }

  protected changePasswordVisibility(passwordInput: HTMLInputElement) {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
  }
}
