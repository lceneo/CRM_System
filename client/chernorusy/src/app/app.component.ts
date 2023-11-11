import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HttpService} from "./shared/services/http.service";
import {AuthorizationService} from "./shared/services/authorization.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    private authorizationS: AuthorizationService,
    private router: Router
  ) {}

  protected isAdmin$ = this.authorizationS.isAdmin$;
  protected isAuthorized$ = this.authorizationS.authorizationStatus;
  signOut() {
    this.authorizationS.logout$()
      .subscribe(() => this.router.navigate(['authentication']));
  }
}
