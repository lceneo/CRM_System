import { getIsCustomizing } from "../customization";
import { prefix } from "../const";

class MessagesStore {
  items: Message[] = this.getMessagesFromStorage();
  pending: Message[] = [];

  private itemsChangeListeners: ((mes: Message) => any)[] = [];
  private pendingChangeListeners: ((mes: Message[]) => any)[] = [];
  private itemsInLocalStorage: Message[] = this.getMessagesFromStorage();

  constructor() {
    if (getIsCustomizing()) {
      this.items.push(new Message("Менеджер вошел в чат", new Date(), "join"));
      this.items.push(
        new Message("Добрый день, у меня появился вопрос", new Date(), "client")
      );
      this.items.push(
        new Message(
          "День добрый, сейчас найдем решение",
          new Date(),
          "server",
          { name: "Майкл", surname: "Жордан" }
        )
      );
    }
  }

  private getMessagesFromStorage(): Message[] {
    return JSON.parse(localStorage.getItem(`${prefix}-messages`) || "[]").map(
      (item: Message) => {
        const sender = { name: item.name, surname: item.surname };
        console.log(
          "parsedMessage",
          item,
          new Message(
            item.content,
            new Date(item.timeStamp),
            item.side,
            sender,
            item.fileKey
          )
        );
        return new Message(
          item.content,
          new Date(item.timeStamp),
          item.side,
          sender,
          item.fileKey
        );
      }
    );
  }

  setMessage(mes: Message) {
    this.items.push(mes);
    this.itemsChangeListeners.forEach((f) => f(mes));
    if (mes.side === "join") {
      return;
    }
    const newLength = this.itemsInLocalStorage.push(mes);
    if (newLength > 20) {
      this.itemsInLocalStorage.shift();
    }
    localStorage.setItem(
      `${prefix}-messages`,
      JSON.stringify(this.itemsInLocalStorage)
    );
  }

  setPending(mes: Message) {
    mes.pending = true;
    this.pending.push(mes);
    this.pendingChangeListeners.forEach((f) => f(this.pending));
  }

  movePending(mes: Message, updated?: Partial<Message>) {
    this.pending = this.pending.filter((m) => m !== mes);
    this.pendingChangeListeners.forEach((f) => f(this.pending));
    if (updated) {
      mes = { ...mes, ...updated };
    }
    mes.pending = false;
    this.setMessage(mes);
  }

  onItemsAdd(f: (mes: Message) => any) {
    this.itemsChangeListeners.push(f);
  }

  onPendingChange(f: (pending: Message[]) => any) {
    this.pendingChangeListeners.push(f);
  }
}

export class Message {
  public timeStamp: Date;
  public pending = false;
  public name?: string;
  public surname?: string;
  constructor(
    public content: string,
    timestamp: Date | string | number,
    public side: "client" | "server" | "join",
    sender?: { name?: string; surname?: string },
    public fileKey?: string
  ) {
    this.timeStamp = new Date(timestamp);
    this.name = sender?.name;
    this.surname = sender?.surname;
  }
}

export const messagesStore = new MessagesStore();
