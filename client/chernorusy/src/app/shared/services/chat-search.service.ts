import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { catchError, map, Observable, of } from 'rxjs';
import { IChatResponseDTO } from '../../modules/chat/helpers/entities/ChatResponseDTO';
import { ChatStatus } from '../../modules/chat/helpers/enums/ChatStatus';

@Injectable({ providedIn: 'root' })
export class ChatSearchService {
  constructor(private httpS: HttpService) {}

  public search$(params: ChatSearchParams | null = {}) {
    return this.httpS
      .post<{
        totalCount: number;
        items: IChatResponseDTO[];
      }>('/Chats/Search', params)
      .pipe(
        catchError(() => of({ totalCount: 0, items: [] as IChatResponseDTO[] }))
      );
  }

  public getForUser$(id: string): Observable<{
    totalCount: number;
    items: IChatResponseDTO[];
  }> {
    return this.search$({ userIds: [id] });
  }

  public getById$(
    ids: string[],
    groupById?: false
  ): Observable<{ totalCount: number; items: IChatResponseDTO[] }>;
  public getById$(
    ids: string[],
    groupById: false
  ): Observable<{
    totalCount: number;
    items: { [chatId: (typeof ids)[number]]: IChatResponseDTO };
  }>;
  public getById$(
    ids: string[],
    groupById: boolean = false
  ): Observable<{
    totalCount: number;
    items:
      | IChatResponseDTO[]
      | { [chatId: (typeof ids)[number]]: IChatResponseDTO };
  }> {
    return this.search$({ ids }).pipe(
      map((resp) => {
        if (!groupById) {
          return resp;
        }
        const grouped = { totalCount: resp.totalCount, items: {} as any };
        resp.items.forEach((chat) => (grouped.items[chat.id] = chat));
        return grouped;
      })
    );
  }
}

export interface ChatSearchParams {
  ids?: string[];
  skip?: number;
  take?: number;
  userIds?: string[];
  chatName?: string;
  chatStatus?: ChatStatus;
}
