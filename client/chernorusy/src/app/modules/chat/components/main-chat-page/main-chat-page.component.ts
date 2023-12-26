import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {AccountRole} from "../../../../shared/models/enums/AccountRole";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {TabsetComponent} from "ngx-bootstrap/tabs";

@Component({
  selector: 'app-main-chat-page',
  templateUrl: './main-chat-page.component.html',
  styleUrls: ['./main-chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainChatPageComponent  {

  @ViewChild(TabsetComponent) tabSetComponent?: TabsetComponent;

  protected selectedTab?: ISelectedTab;

  constructor(
    private authS: AuthorizationService,
    private cdr: ChangeDetectorRef,
  ) {}

  public changeTab(tabHeading: string, selectedChat?: IChatResponseDTO) {
    const tabToOpen = this.tabSetComponent?.tabs.find(tab => tab.heading === tabHeading);
    if (tabToOpen) {
      tabToOpen.active = true;
      this.selectedTab = {
        heading: tabHeading,
        chat: selectedChat ?? undefined
      };
      this.cdr.markForCheck();
    }
  }

  protected role$ = this.authS.role$;
  protected readonly AccountRole = AccountRole;
}

interface ISelectedTab {
  heading: string;
  chat?: IChatResponseDTO;
}
