import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef,
  ElementRef, EventEmitter,
  Input,
  OnChanges,
  OnDestroy, OnInit,
  Renderer2,
  signal,
  ViewChild
} from '@angular/core';
import {MessageService} from "../../services/message.service";
import {IMessageInChat} from "../../../../shared/models/entities/MessageInChat";
import {
  BehaviorSubject, debounceTime,
  defer, delay,
  filter, forkJoin,
  from, fromEvent,
  map,
  merge,
  Observable, of, startWith,
  Subject, Subscription,
  switchMap, take,
  takeUntil,
  tap, withLatestFrom
} from "rxjs";
import {FreeChatService} from "../../services/free-chat.service";
import {MyChatService} from "../../services/my-chat.service";
import {MessageType} from "../../../../shared/models/enums/MessageType";
import {MessagesListComponent, TabType} from "../messages-list/messages-list.component";
import {ChatStatus} from "../../../../shared/models/enums/ChatStatus";
import {MainChatPageComponent} from "../main-chat-page/main-chat-page.component";
import {StaticService} from "../../../../shared/services/static.service";
import {IChatResponseDTO} from "../../../../shared/models/DTO/response/ChatResponseDTO";
import {OverlayContainer} from "@angular/cdk/overlay";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageDialogComponent implements OnChanges, OnInit, OnDestroy {
  @Input({required: true}) chatID?: string;
  @Input({required: true}) chatType: TabType | null = null;

  @ViewChild('msgList') msgListElementRef!: ElementRef<HTMLUListElement>;
  @ViewChild('message') messageElementRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('smileMenu', {static: true}) smileMenu!: MatMenu;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  protected membersSectionOpened = false;
  protected msgValue = '';
  protected currentFiles: File[] = [];
  private maxFilesCount = 10;
  protected chat?: IChatResponseDTO;

  protected messages = signal<IMessageInChat[]>([]);
  protected loadingChat$ = new Subject<boolean>();
  private destroy$ = new Subject<void>();

  constructor(
    private messageS: MessageService,
    private myChatS: MyChatService,
    private freeChatS: FreeChatService,
    private staticS: StaticService,
    private renderer2: Renderer2,
    private messagesListComponent: MessagesListComponent,
    private mainChat: MainChatPageComponent,
    private destroyRef: DestroyRef,
    private overLayContainer: OverlayContainer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if ('chatID in changes' && this.chatID) {
      this.initNewChat();
      this.chat = this.chatType === 'Inbox' ? this.freeChatS.getByID(this.chatID) : this.myChatS.getByID(this.chatID);
    }
  }

  ngOnInit(): void {
    //отключает закрытие по клику внутри matMenu смайлов
    (this.smileMenu as any).closed = this.configureMenuClose(this.smileMenu.close);
  }

  private initNewChat() {
    if (!this.chatID) { return; }

    this.destroy$.next(); // уничтожаем предыдущую подписку
    this.loadingChat$.next(true);

    this.getExistingMessagesInChat()
      .pipe(
        tap(() => { this.loadingChat$.next(false); this.scrollToTheBottom(); }),
        switchMap(() => merge(this.messageS.receivedMessages$, this.messageS.successMessages$)),
        filter(msg => msg.chatId === this.chatID),
        takeUntil(this.destroy$),
      ).subscribe(msg => {

      this.messages.update(messages =>
        [...messages, msg].sort((f, s) =>
          new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime())
      );

      if (msg.mine) { this.scrollToTheBottom(); }
    });
  }

  private getExistingMessagesInChat() {
    return this.messageS.getMessages$(this.chatID!)
      .pipe(
        tap(messages => {
          this.messages.set(
            messages.items.sort((f, s) =>
              new Date(f.dateTime).getTime() - new Date(s.dateTime).getTime())
          )
        })
      );
  }

  private scrollToTheBottom() {
    setTimeout(() => this.msgListElementRef?.nativeElement.scrollTo({
      top: this.msgListElementRef.nativeElement.scrollHeight,
      behavior: 'instant'
    }));
  }



  protected sendMsg() {

    // для отправки надо, чтоб сообщение было не пустым или чтоб был хотя бы один файл
    if (!this.msgValue.trim().length && !this.currentFiles.length) { return; }

    let sendMessageObs$: Observable<void>;

    if (this.currentFiles.length) {
      sendMessageObs$ =
        forkJoin(this.currentFiles.map(file => this.staticS.uploadFile$(file)
          .pipe(
            map(fileKeyObj => ({...fileKeyObj, fileName: file.name}))
          )
        ))
            .pipe(
              map(files => {
                return {
                  message: this.msgValue.trim().length ? this.msgValue : undefined,
                  files
                }
              }),
              switchMap(msgData =>
                  defer(() => from(this.messageS.sendMessage(this.chatID!, msgData))))
          );
    } else {
      sendMessageObs$ = defer(() =>
          from(this.messageS.sendMessage(this.chatID!, {message: this.msgValue, files: []})));
    }

    sendMessageObs$
        .pipe(
            tap(() => {
              this.msgValue = '';
              this.currentFiles = [];
              if (this.fileInput) {
                this.fileInput.nativeElement.value = '';
                this.cdr.detectChanges();
              }
              this.renderer2.setStyle(this.messageElementRef.nativeElement, 'height', `45px`);
            })
        )
        .subscribe();
  }

  pressKey(ev: KeyboardEvent) {
    (ev.key === 'Enter' && ev.ctrlKey) && this.sendMsg()
  }

  public resetMsgValue() {
    this.msgValue = '';
  }

  protected onFileChange(event: Event) {
    //@ts-ignore;
    const files = event.target['files'] as FileList;

    if (!files || !files.length || this.currentFiles.length === this.maxFilesCount) { return; }
    else {
      for (let i = this.currentFiles.length, initialLength = this.currentFiles.length; i < this.maxFilesCount ; i++) {
        const file = files.item(i - initialLength);
        if (!file) { break; }
        this.currentFiles.push(file);
      }
      this.cdr.detectChanges();
    }
  }

  protected joinChat() {
    // не обновляем стор, т.к там рисив будет
    this.freeChatS.joinChat(this.chatID!)
      .pipe(
        tap(() => this.mainChat.changeTab('Мои', this.chat))
      )
      .subscribe();
  }

  protected leaveChat() {
    this.myChatS.leaveChat(this.chatID!)
      .subscribe(() => this.closeDialog());
  }
  protected closeDialog() {
    this.messagesListComponent.closeChat();
  }

  protected toggleBlockStatus() {
    const newStatus = this.chat?.status === ChatStatus.Active ? ChatStatus.Blocked : ChatStatus.Active;
    this.myChatS.changeChatStatus(this.chatID!, newStatus)
      .pipe(
        tap(() => this.closeDialog())
      )
      .subscribe();
  }

  protected toggleArchiveStatus() {
    const newStatus = this.chat?.status === ChatStatus.Archive ? ChatStatus.Active : ChatStatus.Archive;
    this.myChatS.changeChatStatus(this.chatID!, newStatus)
      .pipe(
        tap(() => this.closeDialog())
      )
      .subscribe();
  }

  protected dropFiles(ev: DragEvent) {
    const files = ev.dataTransfer?.files;
    if (files && files.length && this.currentFiles.length < this.maxFilesCount) {
      for (let i = this.currentFiles.length, initialLength = this.currentFiles.length; i < this.maxFilesCount ; i++) {
        const file = files.item(i - initialLength);
        if (!file) { break; }
        this.currentFiles.push(file);
      }
    }
    ev.preventDefault();
  }
  private configureMenuClose(old: MatMenu['close']): MatMenu['close'] {
    const upd = new EventEmitter();
    feed(upd.pipe(
      filter(event => {
        if (event === 'click') {
          // Ignore clicks inside the menu
          return false;
        }
        return true;
      }),
      takeUntilDestroyed(this.destroyRef)
    ), old);
    return upd;
  }
  protected addIconToMsg(event: MouseEvent, icon: string) {
    const textAreaElement = this.messageElementRef.nativeElement;
    const selectionStart = textAreaElement.selectionStart;
    const selectionEnd = textAreaElement.selectionEnd;

    this.msgValue = this.msgValue.substring(0, selectionStart) + icon + this.msgValue.substring(selectionEnd);
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.stopImmediatePropagation();

    setTimeout(() => {
      textAreaElement.setSelectionRange(selectionStart + icon.length, selectionStart + icon.length);
    });
  }

  protected openSmileMenu(smileMenuTriggerer: MatMenuTrigger, smileIcon: MatIcon) {
    const smileMenuItem = this.overLayContainer.getContainerElement().querySelector('.smileMenu') as Element;
    const smileIconElement = smileIcon._elementRef.nativeElement as Element;

    const onElement$ = merge(
      fromEvent(smileMenuItem, 'mouseenter'), fromEvent(smileMenuItem, 'mouseleave'),
      fromEvent(smileIconElement, 'mouseenter'), fromEvent(smileIconElement, 'mouseleave')
      )
      .pipe(
        map(ev => ev.type === 'mouseenter')
      );

    merge(fromEvent(smileMenuItem, 'mouseleave'), fromEvent(smileIconElement, 'mouseleave'))
      .pipe(
        delay(1000),
        withLatestFrom(onElement$),
        takeUntil(smileMenuTriggerer.menuClosed),
      )
      .subscribe(([v1, isOnElement]) => {
        if (smileMenuTriggerer.menuOpen && !isOnElement) { smileMenuTriggerer.closeMenu(); }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly MessageType = MessageType;
  protected readonly ChatStatus = ChatStatus;

  protected readonly smiles = smiles;
}

function feed<T>(from: Observable<T>, to: Subject<T>): Subscription {
  return from.subscribe(
    data => to.next(data),
    err => to.error(err),
    () => to.complete(),
  );
}

const smiles = ['💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','❤️‍','🔥','❤️‍','🩹',
  '💯','♨️','💢','💬','👁️‍🗨️','🗨️','🗯️','💭','💤','🌐','♠️','♥️','♦️','♣️','🃏','🀄️','🎴','🎭️','🔇','🔈️','🔉','🔊','🔔','🔕','🎼','🎵','🎶','💹',
  '🏧','🚮','🚰','♿️','🚹️','🚺️','🚻','🚼️','🚾','🛂','🛃','🛄','🛅','⚠️','🚸','⛔️','🚫','🚳','🚭️','🚯','🚱','🚷','📵','🔞','☢️','☣️','⬆️',
  '↗️','➡️','↘️','⬇️','↙️','⬅️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔃','🔄','🔙','🔚','🔛','🔜','🔝','🛐','⚛️','🕉️','✡️','☸️','☯️','✝️',
  '☦️','☪️','☮️','🕎','🔯','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','⛎','🔀','🔁','🔂','▶️','⏩️','⏭️','⏯️','◀️','⏪️',
  '⏮️','🔼','⏫','🔽','⏬','⏸️','⏹️','⏺️','⏏️','🎦','🔅','🔆','📶','📳','📴','♀️','♂️','⚧','✖️','➕','➖','➗','♾️','‼️','⁉️','❓️','❔','❕',
  '❗️','〰️','💱','💲','⚕️','♻️','⚜️','🔱','📛','🔰','⭕️','✅','☑️','✔️','❌','❎','➰','➿','〽️','✳️','✴️','❇️','©️','®️','™️','#️⃣','*️⃣',
  '0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔠','🔡','🔢','🔣','🔤','🅰️','🆎','🅱️','🆑','🆒','🆓','ℹ️','🆔','Ⓜ️','🆕',
  '🆖','🅾️','🆗','🅿️','🆘','🆙','🆚','🈁','🈂️','🈷️','🈶','🈯️','🉐','🈹','🈚️','🈲','🉑','🈸','🈴','🈳','㊗️','㊙️','🈺','🈵','🔴','🟠','🟡',
  '🟢','🔵','🟣','🟤','⚫️','⚪️','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛️','⬜️','◼️','◻️','◾️','◽️','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘',
  '🔳','🔲','🕛️','🕧️','🕐️','🕜️','🕑️','🕝️','🕒️','🕞️','🕓️','🕟️','🕔️','🕠️','🕕️','🕡️','🕖️','🕢️','🕗️','🕣️','🕘️','🕤️','🕙️','🕥️','🕚️','🕦️','*️','#️',
  '0️','1️','2️','3️','4️','5️','6️','7️','8️','9️','🛎️','🧳','⌛️','⏳️','⌚️','⏰','⏱️','⏲️','🕰️','🌡️','🗺️','🧭','🎃','🎄','🧨','🎈','🎉','🎊','🎎',
  '🎏','🎐','🎀','🎁','🎗️','🎟️','🎫','🔮','🧿','🎮️','🕹️','🎰','🎲','♟️','🧩','🧸','🖼️','🎨','🧵','🧶','👓️','🕶️','🥽','🥼','🦺','👔','👕','👖','🧣',
  '🧤','🧥','🧦','👗','👘','🥻','🩱','🩲','🩳','👙','👚','👛','👜','👝','🛍️','🎒','👞','👟','🥾','🥿','👠','👡','🩰','👢','👑','👒','🎩','🎓️','🧢',
  '⛑️','📿','💄','💍','💎','📢','📣','📯','🎙️','🎚️','🎛️','🎤','🎧️','📻️','🎷','🎸','🎹','🎺','🎻','🪕','🥁','📱','📲','☎️','📞','📟️','📠','🔋','🔌',
  '💻️','🖥️','🖨️','⌨️','🖱️','🖲️','💽','💾','💿️','📀','🧮','🎥','🎞️','📽️','🎬️','📺️','📷️','📸','📹️','📼','🔍️','🔎','🕯️','💡','🔦','🏮','🪔','📔','📕',
  '📖','📗','📘','📙','📚️','📓','📒','📃','📜','📄','📰','🗞️','📑','🔖','🏷️','💰️','💴','💵','💶','💷','💸','💳️','🧾','✉️','💌','📧','🧧','📨','📩',
  '📤️','📥️','📦️','📫️','📪️','📬️','📭️','📮','🗳️','✏️','✒️','🖋️','🖊️','🖌️','🖍️','📝','💼','📁','📂','🗂️','📅','📆','🗒️','🗓️','📇','📈','📉','📊','📋️',
  '📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️','🔒️','🔓️','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','💣️','🏹','🛡️','🔧','🔩','⚙️','🗜️','⚖️',
  '🦯','🔗','⛓️','🧰','🧲','⚗️','🧪','🧫','🧬','🔬','🔭','📡','💉','🩸','💊','🩹','🩺','🚪','🛏️','🛋️','🪑','🚽','🚿','🛁','🪒','🧴','🧷','🧹','🧺','🧻',
  '🧼','🧽','🧯','🛒','🚬','⚰️','⚱️','🏺','🕳️','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏟️','🏛️','🏗️','🧱','🏘️','🏚️','🏠️','🏡','🏢','🏣','🏤','🏥',
  '🏦','🏨','🏩','🏪','🏫','🏬','🏭️','🏯','🏰','💒','🗼','🗽','⛪️','🕌','🛕','🕍','⛩️','🕋','⛲️','⛺️','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🗾',
  '🏞️','🎠','🎡','🎢','💈','🎪','🚂','🚃','🚄','🚅','🚆','🚇️','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍️','🚎','🚐','🚑️','🚒','🚓','🚔️','🚕','🚖','🚗',
  '🚘️','🚙','🚚','🚛','🚜','🏎️','🏍️','🛵','🦽','🦼','🛺','🚲️','🛴','🛹','🚏','🛣️','🛤️','🛢️','⛽️','🚨','🚥','🚦','🛑','🚧','⚓️','⛵️','🛶','🚤','🛳️',
  '⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🎆','🎇','🎑','🗿','⚽️','⚾️','🥎','🏀','🏐','🏈','🏉','🎾','🥏',
  '🎳','🏏','🏑','🏒','🥍','🏓','🏸','🥊','🥋','🥅','⛳️','⛸️','🎣','🤿','🎽','🎿','🛷','🥌','🎯','🪀','🪁','🎱','🎖️','🏆️','🏅','🥇','🥈','🥉',
  '🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅',
  '🍄','🥜','🌰','🍞','🥐','🥖','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲',
  '🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🍦','🍧','🍨','🍩','🍪','🎂',
  '🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕️','🍵','🍶','🍾','🍷','🍸️','🍹','🍺','🍻','🥂','🥃','🥤','🧃','🧉','🧊','🥢','🍽️','🍴','🥄','🔪',
  '🐵','🐒','🦍','🦧','🐶','🐕️','🦮','🐕‍','🦺','🐩','🐺','🦊','🦝','🐱','🐈️','🐈‍','🦁','🐯','🐅','🐆','🐴','🐎','🦄','🦓','🦌','🐮','🐂','🐃','🐄','🐷',
  '🐖','🐗','🐽','🐏','🐑','🐐','🐪','🐫','🦙','🦒','🐘','🦏','🦛','🐭','🐁','🐀','🐹','🐰','🐇','🐿️','🦔','🦇','🐻','🐻‍','❄️','🐨','🐼','🦥','🦦','🦨',
  '🦘','🦡','🐾','🦃','🐔','🐓','🐣','🐤','🐥','🐦️','🐧','🕊️','🦅','🦆','🦢','🦉','🦩','🦚','🦜','🐸','🐊','🐢','🦎','🐍','🐲','🐉','🦕','🦖','🐳','🐋','🐬',
  '🐟️','🐠','🐡','🦈','🐙','🦑','🦀','🦞','🦐','🦪','🐚','🐌','🦋','🐛','🐜','🐝','🐞','🦗','🕷️','🕸️','🦂','🦟','🦠','💐','🌸','💮','🏵️','🌹','🥀','🌺','🌻',
  '🌼','🌷','🌱','🌲','🌳','🌴','🌵','🎋','🎍','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🌍️','🌎️','🌏️','🌑','🌒','🌓','🌔','🌕️','🌖','🌗','🌘','🌙','🌚','🌛','🌜️','☀️',
  '🌝','🌞','🪐','💫','⭐️','🌟','✨','🌠','🌌','☁️','⛅️','⛈️','🌤️','🌥️','🌦️','🌧️','🌨️','🌩️','🌪️','🌫️','🌬️','🌀','🌈','🌂','☂️','☔️','⛱️','⚡️','❄️','☃️','⛄️','☄️',
  '🔥','💧','🌊','💥','💦','💨','😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','😋','😛','😜','🤪','😝',
  '🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐️','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','😮‍','💨','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','😶‍','🌫️',
  '🥴','😵‍','💫','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩',
  '😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽️','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','👋','🤚',
  '🖐️','✋','🖖','👌','🤏','✌️','🤞','🤟','🤘','🤙','👈️','👉️','👆️','🖕','👇️','☝️','👍️','👎️','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿',
  '🦵','🦶','👂️','🦻','👃','🧠','🦷','🦴','👀','👁️','👅','👄','💋','👶','🧒','👦','👧','🧑','👨','👩','🧔','🧔‍♀️','🧔‍♂️','🧑','👨‍','🦰','👩‍','🦰','🧑','👨‍','🦱','👩‍',
  '🦱','🧑','👨‍','🦳','👩‍','🦳','🧑','👨‍','🦲','👩‍','🦲','👱','👱‍♂️','👱‍♀️','🧓','👴','👵','🙍','🙍‍♂️','🙍‍♀️','🙎','🙎‍♂️','🙎‍♀️','🙅','🙅‍♂️','🙅‍♀️','🙆','🙆‍♂️','🙆‍♀️','💁','💁‍♂️','💁‍♀️',
  '🙋','🙋‍♂️','🙋‍♀️','🧏','🧏‍♂️','🧏‍♀️','🙇','🙇‍♂️','🙇‍♀️','🤦','🤦‍♂️','🤦‍♀️','🤷','🤷‍♂️','🤷‍♀️','🧑‍⚕️','👨‍⚕️','👩‍⚕️','🧑‍🎓','👨‍🎓','👩‍🎓','🧑‍🏫','👨‍🏫','👩‍🏫','🧑‍⚖️','👨‍⚖️','👩‍⚖️','🧑‍🌾','👨‍🌾','👩‍🌾',
  '🧑‍🍳','👨‍🍳','👩‍🍳','🧑‍🔧','👨‍🔧','👩‍🔧','🧑‍🏭','👨‍🏭','👩‍🏭','🧑‍💼','👨‍💼','👩‍💼','🧑‍🔬','👨‍🔬','👩‍🔬','🧑‍💻','👨‍💻','👩‍💻','🧑‍🎤','👨‍🎤','👩‍🎤','🧑‍🎨','👨‍🎨','👩‍🎨','🧑‍✈️','👨‍✈️','👩‍✈️','🧑‍🚀',
  '👨‍🚀','👩‍🚀','🧑‍🚒','👨‍🚒','👩‍🚒','👮','👮‍♂️','👮‍♀️','🕵️','🕵️‍♂️','🕵️‍♀️','💂','💂‍♂️','💂‍♀️','👷','👷‍♂️','👷‍♀️','🤴','👸','👳','👳‍♂️','👳‍♀️','👲','🧕','🤵','🤵‍♂️','🤵‍♀️','👰','👰‍♂️','👰‍♀️','🤰',
  '🤱','👩‍','🍼','👨‍','🍼','🧑‍','🍼','👼','🎅','🤶','🧑‍','🎄','🦸','🦸‍♂️','🦸‍♀️','🦹','🦹‍♂️','🦹‍♀️','🧙','🧙‍♂️','🧙‍♀️','🧚','🧚‍♂️','🧚‍♀️','🧛','🧛‍♂️','🧛‍♀️','🧜','🧜‍♂️','🧜‍♀️','🧝','🧝‍♂️','🧝‍♀️',
  '🧞','🧞‍♂️','🧞‍♀️','🧟','🧟‍♂️','🧟‍♀️','💆','💆‍♂️','💆‍♀️','💇','💇‍♂️','💇‍♀️','🚶','🚶‍♂️','🚶‍♀️','🧍','🧍‍♂️','🧍‍♀️','🧎','🧎‍♂️','🧎‍♀️','🧑‍','🦯','👨‍','🦯','👩‍','🦯','🧑‍','🦼','👨‍','🦼','👩‍','🦼',
  '🧑‍','🦽','👨‍','🦽','👩‍','🦽','🏃','🏃‍♂️','🏃‍♀️','💃','🕺','🕴️','👯','👯‍♂️','👯‍♀️','🧖','🧖‍♂️','🧖‍♀️','🧗','🧗‍♂️','🧗‍♀️','🤺','🏇','⛷️','🏂️','🏌️','🏌️‍♂️','🏌️‍♀️','🏄️','🏄‍♂️','🏄‍♀️','🚣',
  '🚣‍♂️','🚣‍♀️','🏊️','🏊‍♂️','🏊‍♀️','⛹️','⛹️‍♂️','⛹️‍♀️','🏋️','🏋️‍♂️','🏋️‍♀️','🚴','🚴‍♂️','🚴‍♀️','🚵','🚵‍♂️','🚵‍♀️','🤸','🤸‍♂️','🤸‍♀️','🤼','🤼‍♂️','🤼‍♀️','🤽','🤽‍♂️','🤽‍♀️','🤾','🤾‍♂️','🤾‍♀️','🤹','🤹‍♂️',
  '🤹‍♀️','🧘','🧘‍♂️','🧘‍♀️','🛀','🛌','🧑‍','🤝‍','🧑','👭','👫','👬','💏','👩‍❤️‍💋‍👨','👨‍❤️‍💋‍👨','👩‍❤️‍💋‍👩','💑','👩‍❤️‍👨','👨‍❤️‍👨','👩‍❤️‍👩','👪️','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦','👨‍👩‍👦‍👦','👨‍👩‍👧‍👧','👨‍👨‍👦','👨‍👨‍👧','👨‍👨‍👧‍👦','👨‍👨‍👦‍👦',
  '👨‍👨‍👧‍👧','👩‍👩‍👦','👩‍👩‍👧','👩‍👩‍👧‍👦','👩‍👩‍👦‍👦','👩‍👩‍👧‍👧','👨‍👦','👨‍👦‍👦','👨‍👧','👨‍👧‍👦','👨‍👧‍👧','👩‍👦','👩‍👦‍👦','👩‍👧','👩‍👧‍👦','👩‍👧‍👧','🗣️','👤','👥','👣'];

