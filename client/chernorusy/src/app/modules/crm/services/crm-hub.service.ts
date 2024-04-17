import {Injectable, isDevMode} from '@angular/core';
import {AbstractSocketService} from "../../../shared/helpers/abstract-socket.service";
import {config} from "../../../../main";

@Injectable({
  providedIn: 'root'
})
export class CrmHubService extends AbstractSocketService{

  constructor() {
    super(isDevMode() ? 'https://request.stk8s.66bit.ru/Hubs/Crm' : `${config.protocol}://${config.apiUrl}/${config.crmHubUrl}`);
  }
}

