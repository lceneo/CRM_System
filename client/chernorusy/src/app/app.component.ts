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
    this.messageS.sendMessage('d6b45035-9d11-4b17-bb21-75e429328a28', 'msgToAdmin', 0);
  }

  sendToClient(){
    this.messageS.sendMessage('685cf3f5-b323-4ad2-8c8d-6881f6191adc', 'msgToClient', 0);
  }
}
