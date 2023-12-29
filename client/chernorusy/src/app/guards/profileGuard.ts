import {inject} from "@angular/core";
import {ProfileService} from "../shared/services/profile.service";
import {ActivatedRouteSnapshot, Router} from "@angular/router";
import {AuthorizationService} from "../shared/services/authorization.service";
import {interval, map, of, take, tap} from "rxjs";

export const profileGuard = (route: ActivatedRouteSnapshot) => {
  const profileS = inject(ProfileService);
  const authS = inject(AuthorizationService);
  const router = inject(Router);
  const myProfileID = profileS.profile()?.id ?? authS.userID;
  const id = route.paramMap.get('id') as string;
  return myProfileID === id ? of(true) : interval(1000)
    .pipe(
      take(1),
      map(() => authS.userID === id),
      tap(state => {
        if (!state) { router.navigate(['not-found']); }
      })
    )
}
