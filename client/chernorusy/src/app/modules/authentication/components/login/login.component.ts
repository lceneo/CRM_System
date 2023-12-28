import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {Router} from "@angular/router";
import {ILoginRequestDTO} from "../../../../shared/models/DTO/request/LoginRequestDTO";
import {IRecoverPasswordRequestDTO} from "../../../../shared/models/DTO/request/RecoverPasswordRequestDTO";
import {ProfileService} from "../../../../shared/services/profile.service";
import {tap} from "rxjs";
import {MyValidatorsService} from "../../../../shared/services/my-validators.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  constructor(
    private authorizationS: AuthorizationService,
    private profileS: ProfileService,
    private myValidatorS: MyValidatorsService,
    private router: Router
  ) {}

  protected passwordMode: 'login' | 'recover' = 'login';
  protected authMode: 'login' | 'registration' = 'login';
  protected passwordVisible = false;

  protected form = new FormGroup({
    login: new FormControl<string>('', [Validators.required, this.myValidatorS.minMaxLengthValidator(4, 15), this.myValidatorS.onlyLatinSymbolsAndDigits]),
    password: new FormControl<string>('', [Validators.required, this.myValidatorS.minMaxLengthValidator(3, 15), this.myValidatorS.passwordValidator])
  });

  protected submitForm() {
    if (this.passwordMode === 'login') {
    this.authorizationS.login$(this.form.value as ILoginRequestDTO)
        .pipe(
            tap((loginResult) => {
              if (loginResult) { this.profileS.updateProfileByHTTP().subscribe();}
            })
        )
      .subscribe(loginResult => {
        if (loginResult) { this.router.navigate(['main']); }
      });
    } else {
      this.authorizationS.recoverPassword({login: this.form.value.login} as IRecoverPasswordRequestDTO).subscribe();
    }
  }

  protected changePasswordMode() {
    if (this.passwordMode === 'login') {
      this.passwordMode = 'recover';
      this.form.controls.password.disable();
    } else {
      this.passwordMode = 'login';
      this.form.controls.password.enable();
    }
  }

  protected changeAuthMode() {
    this.authMode = this.authMode === 'login' ? 'registration' : 'login';
  }

  protected changePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
