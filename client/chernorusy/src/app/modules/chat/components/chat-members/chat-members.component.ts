import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  EffectRef,
  Injector,
  Input,
  signal,
  Signal
} from '@angular/core';
import {IProfileOutShort} from "../../../../shared/models/entities/ProfileOutShort";
import {FreeChatService} from "../../services/free-chat.service";
import {MyChatService} from "../../services/my-chat.service";

@Component({
  selector: 'app-chat-members',
  templateUrl: './chat-members.component.html',
  styleUrls: ['./chat-members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMembersComponent {
  @Input({required: true}) set chatID(id:string) {
    this.checkChatStatusEffect?.destroy();

    const isInFreeChats = this.freeChatS.getByID(id);
    const freeChatProfileSignal = computed(() => this.freeChatS.getEntityAsync(id)()?.profiles ?? []);
    const myChatProfileSignal = computed(() => this.myChatS.getEntityAsync(id)()?.profiles ?? []);

    if (isInFreeChats) {
      this.chatMembers = computed(() => this.freeChatS.getEntityAsync(id)()?.profiles ?? []);
      this.checkChatStatusEffect = effect(() => {
        if (!this.freeChatS.getByID(id)) { this.chatMembers = myChatProfileSignal; }
      }, {injector: this.injector})
    } else {
      this.chatMembers = computed(() => this.myChatS.getEntityAsync(id)()?.profiles ?? []);
      this.checkChatStatusEffect = effect(() => {
        if (!this.myChatS.getByID(id)) { this.chatMembers = myChatProfileSignal; }
      }, {injector: this.injector});
    }
  }

  constructor(
    private freeChatS: FreeChatService,
    private myChatS: MyChatService,
    private injector: Injector
  ) {}

  protected chatMembers?: Signal<IProfileOutShort[]>;
  private checkChatStatusEffect?: EffectRef;
}
