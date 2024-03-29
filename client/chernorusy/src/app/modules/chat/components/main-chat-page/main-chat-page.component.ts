import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild} from '@angular/core';
import {AccountRole} from "../../../../shared/models/enums/AccountRole";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {TabDirective, TabsetComponent} from "ngx-bootstrap/tabs";
import {ProfileService} from "../../../../shared/services/profile.service";
import {MessageService} from "../../services/message.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {filter} from "rxjs";
import {FreeChatService} from "../../services/free-chat.service";
import {MyChatService} from "../../services/my-chat.service";

@Component({
  selector: 'app-main-chat-page',
  templateUrl: './main-chat-page.component.html',
  styleUrls: ['./main-chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainChatPageComponent implements OnInit {

  @ViewChild(TabsetComponent) tabSetComponent?: TabsetComponent;

  protected selectedTab?: ISelectedTab;
  constructor(
    private authS: AuthorizationService,
    private profileS: ProfileService,
    private myChatS: MyChatService,
    private freeChatS: FreeChatService,
    private messageS: MessageService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  protected profile = this.profileS.profile;
  protected selectedChat?: ISelectedChat;
  ngOnInit(): void {
    this.listenForNewMessages();
  }
  public changeTab(tabHeading: string, selectedChat?: IChatResponseDTO) {
    if (selectedChat) { this.changeSelectedChat(selectedChat.id, tabHeading); }

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

  protected selectTab(tab: TabDirective) {
    const a = tab;
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
  heading: string;
  chat?: IChatResponseDTO;
}

interface ISelectedChat {
  chatID: string;
  tabHeading: string;
}
