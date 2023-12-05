import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {HttpService} from "./shared/services/http.service";
import {AuthorizationService} from "./shared/services/authorization.service";
import {Router} from "@angular/router";
import {ProfileService} from "./shared/services/profile.service";
import {MessageService} from "./modules/chat/services/message.service";
import {map} from "rxjs";
import {IProfileResponseDTO} from "./shared/models/DTO/response/ProfileResponseDTO";
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
    this.profileS.getProfiles$()
      .pipe(
        map(profiles => (profiles?.items.find(p => p.name === 'Name of admin') as IProfileResponseDTO).id)
      ).subscribe(id => this.messageS.sendMessage(id, 'msgToAdmin', 0));
  }

  sendToClient(){
    this.profileS.getProfiles$()
      .pipe(
        map(profiles => (profiles?.items.find(p => p.name === 'Name of client') as IProfileResponseDTO).id)
      ).subscribe(id => this.messageS.sendMessage(id, 'msgToClient', 0));
  }
}
