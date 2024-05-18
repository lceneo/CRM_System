import {Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {catchError, Observable, of} from "rxjs";
import {IChatResponseDTO} from "../../modules/chat/helpers/entities/ChatResponseDTO";
import {ChatStatus} from "../../modules/chat/helpers/enums/ChatStatus";

@Injectable({providedIn: 'root'})
export class ChatSearchService {

  constructor(
    private httpS: HttpService,
  ) {}

  public getForUser$(id: string): Observable<{
    totalCount: number,
    items: IChatResponseDTO[]
  }> {
    return this.httpS.post<{
      totalCount: number,
      items: IChatResponseDTO[]
    }>('/Chats/Search', {userIds: [id]})
      .pipe(
        catchError(() => of({totalCount: 0, items: [] as IChatResponseDTO[]}))
      )
  }
}

export interface ChatSearchParams {
  "ids": string[],
  "skip": number,
  "take": number,
  "userIds": string[],
  "chatName": string,
  "chatStatus": ChatStatus,
}
