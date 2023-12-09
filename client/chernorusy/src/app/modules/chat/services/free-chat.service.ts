import { Injectable } from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";

@Injectable({
  providedIn: 'root'
})
export class FreeChatService extends EntityStateManager<IChatResponseDTO> {

  protected override initMethod = '/Chats/Free';
  protected override initial() {
    this.initStore();
    this.registrateSocketHandlers();
  }

  private registrateSocketHandlers() {
    const updateFreeChatsFn = () => {
      this.initStore();
    }

    this.socketS.listenMethod('UpdateFreeChats', updateFreeChatsFn);
  }
}
