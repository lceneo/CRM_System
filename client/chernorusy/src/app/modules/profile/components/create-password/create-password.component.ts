import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {tap} from "rxjs";

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePasswordComponent {

  @Input({required: true}) userID!: string;

  @Output() passwordSet$ = new EventEmitter<boolean>();

  protected password = "";

  constructor(
    private authorizationS: AuthorizationService,
  ) {}

  protected setPassword() {
    this.authorizationS.createPassword(this.userID, { password: this.password })
      .pipe(
        tap(() => this.passwordSet$.emit(true))
      )
      .subscribe();
  }
}
