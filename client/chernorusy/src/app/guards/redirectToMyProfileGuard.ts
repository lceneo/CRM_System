import {inject} from "@angular/core";
import {AuthorizationService} from "../shared/services/authorization.service";
import {map, of, take, tap} from "rxjs";
import {Router} from "@angular/router";
import {ProfileService} from "../shared/services/profile.service";

export const redirectToMyProfileGuard = () => {
  const router = inject(Router);
  const profileS = inject(ProfileService);
  const authS = inject(AuthorizationService);
  const myProfileID = profileS.profile()?.id || authS.userID;
  return of(false)
    .pipe(
      tap(() => {
        if (myProfileID) {
          router.navigate(['profile', myProfileID]);
        } else {
          router.navigate(['authentication']);
        }
      }
    ))
}
