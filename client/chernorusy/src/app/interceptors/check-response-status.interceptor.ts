import {Injectable, Provider} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HTTP_INTERCEPTORS
} from '@angular/common/http';
import {catchError, Observable, of, throwError} from 'rxjs';
import {AuthorizationService} from "../shared/services/authorization.service";

@Injectable()
export class CheckResponseStatusInterceptor implements HttpInterceptor {

  constructor(
    private authorizationS: AuthorizationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request)
      .pipe(
        catchError(err => {
          if (err.status === 401) { // если ошибка авторизации, то разлогиниваемся
            this.authorizationS.logout$(true);
          }
          return throwError(() => Error('Ошибка авторизации'))
        })
      )
  }
}

export const checkResponseInterceptor: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: CheckResponseStatusInterceptor,
  multi: true
}
