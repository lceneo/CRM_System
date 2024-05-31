export class Events {
  listeners: Record<string, any[]> = {};

  listen(type: string, handler: (...v: any[]) => any) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  private lastArchive = new Date("1999-01-01");

  trigger(type: string, ...params: any[]) {
    if (!this.listeners[type]) {
      return;
    }
    if (
      type === "archive" &&
      Date.now() - this.lastArchive.getTime() < 1000 * 10
    ) {
      return;
    }
    if (type === "archive") {
      this.lastArchive = new Date();
    }
    this.listeners[type].forEach((handler) => handler(...params));
  }
}

export const events = new Events();
