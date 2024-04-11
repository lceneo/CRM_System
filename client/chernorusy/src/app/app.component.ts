import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AuthorizationService} from "./shared/services/authorization.service";
import {Router} from "@angular/router";
import {ProfileService} from "./shared/services/profile.service";
import {AccountRole} from "./modules/profile/enums/AccountRole";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit{
  constructor(
    private authorizationS: AuthorizationService,
    private profileS: ProfileService,
    private router: Router
  ) {}

  protected isAdmin$ = this.authorizationS.isAdmin$;
  protected isAuthorized$ = this.authorizationS.authorizationStatus;
  protected role$ = this.authorizationS.role$;

  protected profile = this.profileS.profile;
  signOut() {
    this.profileS.signOut();
    this.authorizationS.logout$()
      .subscribe(() => this.router.navigate(['authentication']));
  }

  ngOnInit(): void {
    this.profileS.determineInitialState();
  }

  protected readonly AccountRole = AccountRole;
}
