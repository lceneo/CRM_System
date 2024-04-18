import {prefix} from "../const";

export class LocalStorage {
	static get token() {
		return localStorage.getItem(`${prefix}-token`);
	}
	static get chatId() {
		return localStorage.getItem(`${prefix}-chatId`);
	}

	static get manager(): ManagerData | null {
		const manager =  localStorage.getItem(`${prefix}-manager`);
		if (!manager) {
			return null;
		}
		return JSON.parse(manager);
	}

	static set manager(manager: ManagerData | null) {
		localStorage.setItem(`${prefix}-manager`, JSON.stringify(manager));
	}
}

export interface ManagerData {id: string, name: string, surname: string}
