import {computed, Pipe, PipeTransform, Signal} from '@angular/core';
import {TabType} from "../components/messages-list/messages-list.component";
import {FreeChatService} from "../services/free-chat.service";
import {MyChatService} from "../services/my-chat.service";

@Pipe({
  name: 'unreadChats',
  standalone: true
})
export class UnreadChatsPipe implements PipeTransform {

  constructor(
    private myChatsS: MyChatService,
    private freeChatS: FreeChatService
  ) {}
  transform(chatType: TabType): Signal<number> {
    const chatS = chatType === 'Mine' ? this.myChatsS : this.freeChatS;
    const getEntitiesSignal = chatS.getEntitiesAsync();
    return computed(() => getEntitiesSignal()
      .filter(chat => !!chat.unreadMessagesCount)
      .length);
  }
}
