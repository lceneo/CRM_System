import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {Router} from "@angular/router";
import {ILoginRequestDTO} from "../../../../shared/models/DTO/request/LoginRequestDTO";
import {IRecoverPasswordRequestDTO} from "../../../../shared/models/DTO/request/RecoverPasswordRequestDTO";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  constructor(
    private authorizationS: AuthorizationService,
    private router: Router
  ) {}

  protected mode: 'login' | 'recover' = 'login';

  protected form = new FormGroup({
    login: new FormControl<string>(''),
    password: new FormControl<string>('')
  });

  protected submitForm() {
    if (this.mode === 'login') {
    this.authorizationS.login$(this.form.value as ILoginRequestDTO)
      .subscribe(loginResult => {
        if (loginResult) { this.router.navigate(['main']); }
      });
    } else {
      this.authorizationS.recoverPassword({login: this.form.value.login} as IRecoverPasswordRequestDTO).subscribe();
    }
  }

  protected changeMode() {
    if (this.mode === 'login') {
      this.mode = 'recover';
      this.form.controls.password.disable();
    } else {
      this.mode = 'login';
      this.form.controls.password.enable();
    }
  }
}
