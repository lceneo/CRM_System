import {inject} from "@angular/core";
import {AuthorizationService} from "../shared/services/authorization.service";
import {filter, map, take, tap} from "rxjs";
import {Router} from "@angular/router";

export const adminGuard = () => {
  const authS = inject(AuthorizationService);
  const router = inject(Router);
  return authS.isAdmin$
    .pipe(
      filter(value => typeof value === 'boolean'),
      take(1),
      map(isAdmin => {
        if (!isAdmin) { router.navigate(['main'])}
        return isAdmin;
      })
    )
}
