import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {AuthorizationService} from "../../../shared/services/authorization.service";
import {Router} from "@angular/router";
import {ILoginRequestDTO} from "../../../shared/models/DTO/request/LoginRequestDTO";

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

  protected form = new FormGroup({
    login: new FormControl<string>(''),
    password: new FormControl<string>('')
  });

  submitForm() {
    this.authorizationS.login$(this.form.value as ILoginRequestDTO)
      .subscribe(loginResult => {
        if (loginResult) { this.router.navigate(['main']); }
      })
  }
}
