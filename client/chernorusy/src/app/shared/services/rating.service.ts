import {Injectable} from "@angular/core";
import {HttpService} from "./http.service";
import {BehaviorSubject, catchError, distinctUntilChanged, map, Observable, switchMap, tap} from "rxjs";
import {pick} from "lodash";

@Injectable({providedIn: 'root'})
export class RatingService {

  constructor(
    private httpS: HttpService,
  ) {}

  private allRatings$ = new BehaviorSubject<AllRatings>({});

  public getMany$(managersIds: string[]) {
    const haveNoRating = managersIds.filter(id => !(id in this.allRatings$.value));
    if (!haveNoRating.length) {
      return this.allRatings$.pipe(
        map(allRatings => pick(allRatings, managersIds))
      )
    }
    return this.getManyForce$(haveNoRating)
      .pipe(
        switchMap(() => this.allRatings$
          .pipe(
            map(allRatings => pick(allRatings, managersIds))
          )
        )
      )
  }

  public getManyForce$(managersIds: string[]) {
    return this.httpS.post<RatingGetResponse[]>('/Rating/Statistics', { managersIds })
      .pipe(
        catchError(() => []),
        tap(ratings => {
          const curRatings = this.allRatings$.value;
          ratings.forEach(rating => {
            curRatings[rating.managerId] = { count: rating.totalCount, avg: rating.averageScore };
          })
          this.allRatings$.next(curRatings);
        }),
        switchMap(() => this.allRatings$.asObservable()
          .pipe(map(allRatings => pick(allRatings, managersIds)))
        )
      )
  }

  public getID$(id: string): Observable<{ count: number, avg: number }> {
    if ('id' in this.allRatings$.value) {
      return this.allRatings$.pipe(
        map(allRatings => allRatings[id]),
        distinctUntilChanged((previous, current) =>
          previous.count === current.count && previous.avg === current.avg
        ),
      )
    }
    return this.getManyForce$([id])
      .pipe(
        switchMap(() => this.getID$(id))
      );
  }
}

interface RatingGetResponse {
  managerId: string,
  averageScore: number,
  totalCount: number
}

interface RatingGetIDResponse {
  "id": string,
  "manager": {
    "id": string,
    "surname": string,
    "name": string,
    "patronimic": string,
    "about": string,
    "role": number,
    "startMessage": string,
    "endMesssage": string
  },
  "chat": {
    "id": string,
    "name": string,
    "status": number
  },
  "comment": string,
  "score": number
}

export type AllRatings = {[managerId: string | number]: { count: number, avg: number }};
