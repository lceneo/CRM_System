import {inject} from "@angular/core";
import {AuthorizationService} from "../shared/services/authorization.service";
import {map, tap} from "rxjs";
import {Router} from "@angular/router";

export const authorizationGuard = () => {
  const router = inject(Router);
  return inject(AuthorizationService).authorizationStatus
    .pipe(
      map(status => !!status),
      tap(status => {
        if (!status) {
          router.navigate(["authentication"]);
        }
      })
    )
}
