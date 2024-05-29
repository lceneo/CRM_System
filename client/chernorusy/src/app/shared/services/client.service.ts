import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { catchError, map, of, tap } from 'rxjs';
import { EntityStateManager } from '../helpers/entityStateManager';

@Injectable({ providedIn: 'root' })
export class ClientService extends EntityStateManager<Client> {
  protected override httpInitMethod: 'get' | 'post' = 'post';
  protected override httpInitBody?: any = {};
  protected override initMethod: string = '/Client/Search';
  protected override mapFn?: Function | undefined = (
    resp: ClientSearchResponse
  ) => resp.items;
  constructor() {
    super();
    this.getEntitiesSync;
  }

  updateData$() {
    return this.search$().pipe(
      tap((resp) => {
        this.upsertEntities(resp.items);
      })
    );
  }

  createOrUpdate$(client: ClientCreateOrUpdate) {
    return this.httpS
      .post<{
        id: string;
        isCreated: boolean;
      }>('/Client', client)
      .pipe(
        tap(({ id, isCreated }) => {
          if (!isCreated) {
            this.updateByID(id, client);
          } else {
            this.upsertEntities([
              {
                phone: null,
                email: null,
                patronymic: null,
                description: null,
                ...client,
                id,
              },
            ]);
          }
        })
      );
  }

  delete$(clientId: string) {
    return this.httpS
      .delete(`/Client/${clientId}`)
      .pipe(tap(() => this.removeByID(clientId)));
  }

  search$(search: ClientSearch = {}) {
    return this.httpS
      .post<ClientSearchResponse>('/Client/Search', search)
      .pipe(catchError(() => of({ totalCount: 0, items: [] })));
  }

  getOne$(keyObj: { id: string } | { phone: string } | { email: string }) {
    const search: ClientSearch = { skip: 0, take: 1 };
    if ('id' in keyObj) {
      search.ids = [keyObj.id];
    } else {
      Object.keys(keyObj).forEach(
        (k) =>
          (search[k as keyof ClientSearch] = keyObj[k as keyof typeof keyObj])
      );
    }
    return this.search$(search).pipe(
      map((resp) => (resp.items.length ? resp.items[0] : null)),
      catchError(() => of(null))
    );
  }
}

export interface ClientSearchResponse {
  totalCount: number;
  items: Client[];
}

export interface Client {
  id: string;
  surname: string | null;
  name: string | null;
  patronymic: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
}

export type ClientCreateOrUpdate =
  | {
      id?: string;
      surname: string;
      name: string;
      patronymic?: string | null;
      email: string;
      description?: string | null;
    }
  | {
      id?: string;
      surname: string;
      name: string;
      patronymic?: string | null;
      phone: string;
      description?: string | null;
    };

export interface ClientSearch {
  ids?: string[];
  skip?: number;
  take?: number;
  surname?: string;
  name?: string;
  patronymic?: string;
  email?: string;
  phone?: string;
  description?: string;
}
