import {
  computed,
  effect,
  signal,
  Signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Component, Injector, Input } from '@angular/core';
import { ChatSearchService } from 'src/app/shared/services/chat-search.service';
import { Client, ClientService } from 'src/app/shared/services/client.service';
import { FreeChatService } from '../../services/free-chat.service';
import { MyChatService } from '../../services/my-chat.service';
import { takeUntil, Subject, switchMap, tap } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-chat-client-info',
  templateUrl: './chat-client-info.component.html',
  styleUrls: ['./chat-client-info.component.scss'],
})
export class ChatClientInfoComponent {
  @ViewChild('createClientModal') createClientModal!: TemplateRef<any>;
  @Input({ required: true })
  set chatID(id: string) {
    this._chatID = id;
    const chatS = this.myChatS.getByID(id) ? this.myChatS : this.freeChatS;
    const chatSignal = computed(() => chatS.getEntityAsync(id)() ?? null);
    const clientSignal = computed(() => {
      const chat = chatSignal();
      const client = chat?.client;
      console.log('chat.client', chat?.client);
      return client ?? null;
    });
    this.settedClient = clientSignal;
    this.selectedSetClient.set(clientSignal());

    this.myChatS
      .getUserSendInfo$(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((sendInfo) => {
        this.existedClient.set(sendInfo?.existed ?? null);
        this.sentClient.set(sendInfo?.request ?? null);
      });
  }

  get chatID() {
    return this._chatID;
  }

  private _chatID!: string;

  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private chatId?: string;

  settedClient?: Signal<Client | null>;
  selectedSetClient = signal<Client | null>(null);

  existedClient = signal<Client | null>(null);
  sentClient = signal<Omit<Client, 'id'> | null>(null);

  getFio(
    client: {
      surname: string | null;
      name: string | null;
      patronymic: string | null;
    } | null
  ): string {
    return [client?.surname, client?.name, client?.patronymic]
      .filter(Boolean)
      .join(' ');
  }

  allClients = this.clientS.getEntitiesAsync();
  ngOnInit() {
    effect(
      () => {
        console.log('allClients', this.allClients());
        console.log('selectedClient', this.selectedSetClient());
      },
      { injector: this.injector }
    );
  }

  setClient(clientId: string) {
    console.log(`chatId: ${this.chatID} clientId: ${clientId}`);
    this.myChatS.setChatClient$(this.chatID, clientId).subscribe(() => {
      this.selectedSetClient.set(this.clientS.getByID(clientId) ?? null);
    });
  }

  searchClientFn = (term: string, item: Client) => {
    term = term.trim();
    return (
      item.name?.startsWith?.(term) ||
      item.surname?.startsWith?.(term) ||
      item.patronymic?.startsWith?.(term) ||
      item.phone?.startsWith?.(term) ||
      item.email?.startsWith?.(term)
    );
  };

  openSelect(ngSelect: NgSelectComponent) {
    ngSelect.element.classList.remove('closed');
    if (this.selectedSetClient()) {
      while (ngSelect.selectedValues.length) {
        ngSelect.selectedValues.pop();
      }
      ngSelect.selectedValues.push(this.selectedSetClient());
    }
    ngSelect.open();
  }

  closeSelect(ngSelect: NgSelectComponent) {
    ngSelect.close();
    ngSelect.element.classList.add('closed');
  }

  ngSelectVisibilityStyles(ngSelect: NgSelectComponent) {
    const isOpen = ngSelect.isOpen;
    const obj = {
      visibility: isOpen ? 'visible' : 'hidden',
    } as any;
    // if (!isOpen) {
    //   obj.width = '0px';
    //   obj.height = '0px';
    // }
    return obj;
  }

  createClient() {
    this.dialogRef = this.matDialog.open(this.createClientModal);
  }

  fg = this.fb.group(
    {
      surname: ['', Validators.required, Validators.minLength(3)],
      name: ['', Validators.required, Validators.minLength(3)],
      patronymic: [],
      phone: [
        '',
        Validators.pattern(
          /^\+?\s*\d{1}\s*\(?\s*\d{3}\s*\)?\s*-?\s*\d{3}\s*-?\s*\d{2}\s*-?\s*\d{2}$/
        ),
      ],
      email: [
        '',
        Validators.pattern(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ),
      ],
    },
    { validators: [phoneOrEmailValidator] }
  );

  saveForm() {
    const newClient = this.fg.value;
    Object.keys(newClient).forEach(
      (key) => (newClient[key] = newClient[key].trim())
    );
    this.dialogRef?.close();
    this.clientS
      .createOrUpdate$(newClient)
      .pipe(tap((resp) => this.setClient(resp.id)))
      .subscribe({ error: () => alert('Не удалось создать пользователя') });
  }

  private dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private clientS: ClientService,
    private freeChatS: FreeChatService,
    private myChatS: MyChatService,
    private injector: Injector,
    private matDialog: MatDialog,
    private fb: FormBuilder
  ) {}
}

const phoneOrEmailValidator = (group: FormGroup): ValidationErrors | null => {
  if (!!group.value.phone.trim().length && !!group.value.email.trim().length) {
    return { phoneOrEmail: true };
  }
  return null;
};
