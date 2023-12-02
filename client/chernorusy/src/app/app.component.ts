import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {HttpService} from "./shared/services/http.service";
import {AuthorizationService} from "./shared/services/authorization.service";
import {Router} from "@angular/router";
import {ProfileService} from "./shared/services/profile.service";
import {MessageService} from "./modules/chat/services/message.service";
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
    private messageS: MessageService,
    private router: Router
  ) {}

  protected isAdmin$ = this.authorizationS.isAdmin$;
  protected isAuthorized$ = this.authorizationS.authorizationStatus;

  protected profile = this.profileS.profile;
  signOut() {
    this.profileS.signOut();
    this.authorizationS.logout$()
      .subscribe(() => this.router.navigate(['authentication']));
  }

  ngOnInit(): void {
    this.profileS.determineInitialState();
  }

  sendToAdmin(){
    this.messageS.sendMessage('5968110c-d992-420a-9fe8-af487151b83d', 'msgToAdmin', 0);
  }

  sendToClient(){
    this.messageS.sendMessage('91685c6e-e598-44e6-b550-3d94041da2aa', 'msgToClient', 0);
  }
}
