import {Injectable, isDevMode} from '@angular/core';
import {config} from "../../../../main";
import {AbstractSocketService} from "../../../shared/helpers/abstract-socket.service";

@Injectable({
  providedIn: 'root'
})
export class ChatHubService extends AbstractSocketService {
  constructor() {
    super(isDevMode() ? 'https://request.stk8s.66bit.ru/Hubs/Chats' : `${config.protocol}://${config.apiUrl}/${config.chatHubUrl}`);
  }
}
