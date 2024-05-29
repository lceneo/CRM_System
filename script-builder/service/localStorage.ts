import { prefix } from "../const";

export class LocalStorage {
  static get token() {
    return localStorage.getItem(`${prefix}-token`);
  }
  static get chatId() {
    return localStorage.getItem(`${prefix}-chatId`);
  }

  static get manager(): ManagerData | null {
    const manager = localStorage.getItem(`${prefix}-manager`);
    if (!manager) {
      return null;
    }
    return JSON.parse(manager);
  }

  static set manager(manager: ManagerData | null) {
    localStorage.setItem(`${prefix}-manager`, JSON.stringify(manager));
  }

  static get client(): ClientData | null {
    const client = localStorage.getItem(`${prefix}-client`);
    if (!client) {
      return null;
    }
    return JSON.parse(client);
  }

  static set client(client: ClientData | null) {
    localStorage.setItem(`${prefix}-client`, JSON.stringify(client));
  }
}

export interface ManagerData {
  id: string;
  name: string;
  surname: string;
}
export type ClientData =
  | { name: string; surname: string; patronymic?: string; email: string }
  | { name: string; surname: string; patronymic?: string; phone: string };
