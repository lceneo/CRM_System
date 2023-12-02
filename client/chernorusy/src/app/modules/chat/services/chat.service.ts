import {computed, Injectable, signal} from '@angular/core';
import {HttpService} from "../../../shared/services/http.service";
import {IChatResponseDTO} from "../../../shared/models/DTO/response/ChatResponseDTO";
import {IEntityState} from "../../../shared/models/states/EntityState";
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {SocketService} from "../../../shared/services/socket.service";

@Injectable({
  providedIn: 'root'
})
export class ChatService extends EntityStateManager<IChatResponseDTO>{

  protected override initMethod = '/Chats/My';
  constructor(
    private socketS: SocketService
  ) {
    super();
    this.initStore();
    this.listenSocket();
  }

  private listenSocket() {
    this.socketS.listenMethod('Recieve', (chat: IChatResponseDTO) => this.upsertEntities([chat]));
  }

}
