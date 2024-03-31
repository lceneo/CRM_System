import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild} from '@angular/core';
import {AccountRole} from "../../../profile/enums/AccountRole";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {IChatResponseDTO} from "../../helpers/entities/ChatResponseDTO";
import {TabDirective, TabsetComponent} from "ngx-bootstrap/tabs";
import {ProfileService} from "../../../../shared/services/profile.service";
import {MessageService} from "../../services/message.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {filter} from "rxjs";
import {FreeChatService} from "../../services/free-chat.service";
import {MyChatService} from "../../services/my-chat.service";
import {TabType} from "../messages-list/messages-list.component";

@Component({
  selector: 'app-main-chat-page',
  templateUrl: './main-chat-page.component.html',
  styleUrls: ['./main-chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainChatPageComponent implements OnInit {

  @ViewChild(TabsetComponent) tabSetComponent?: TabsetComponent;
  @ViewChild('tabMine') tabMine?: TabDirective;

  protected selectedTab?: ISelectedTab;
  constructor(
    private authS: AuthorizationService,
    private profileS: ProfileService,
    private messageS: MessageService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  protected profile = this.profileS.profile;
  protected selectedChat?: ISelectedChat;
  ngOnInit(): void {
    this.listenForNewMessages();
  }
  public changeTab(tabHeading: TabType, selectedChat?: IChatResponseDTO) {
    if (selectedChat) { this.changeSelectedChat(selectedChat.id, tabHeading); }

    let tabToOpen: TabDirective | undefined;
    switch (tabHeading) {
      case 'Mine':
        tabToOpen = this.tabMine;
    }
    if (tabToOpen) {
      tabToOpen.active = true;
      this.selectedTab = {
        heading: tabHeading,
        chat: selectedChat ?? undefined
      };
      this.cdr.markForCheck();
    }
  }

  protected deselectTab(tab: TabDirective) {
    if (this.selectedChat?.tabHeading === tab.heading) { this.changeSelectedChat(undefined); }
  }

  protected changeSelectedChat(chatID: string | undefined, tabHeading?: string) {
    if (chatID && !this.selectedChat && tabHeading) { this.selectedChat = { chatID, tabHeading } }
    else if (chatID && this.selectedChat && tabHeading) { this.selectedChat.chatID = chatID; this.selectedChat.tabHeading = tabHeading; }
    else { this.selectedChat = undefined; }
    console.log(this.selectedChat)
  }
  private listenForNewMessages() {
    this.messageS.receivedMessages$
      .pipe(
        filter(msgReceive => msgReceive.chatId !== this.selectedChat?.chatID),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(msgReceive => {

    });
  }

  protected role$ = this.authS.role$;
  protected readonly AccountRole = AccountRole;
}


interface ISelectedTab {
  heading: TabType;
  chat?: IChatResponseDTO;
}

interface ISelectedChat {
  chatID: string;
  tabHeading: string;
}
