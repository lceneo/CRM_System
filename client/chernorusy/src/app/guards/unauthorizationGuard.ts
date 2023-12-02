import {inject} from "@angular/core";
import {AuthorizationService} from "../shared/services/authorization.service";
import {filter, map, take, tap} from "rxjs";
import {Router} from "@angular/router";

export const unauthorizationGuard = () => {
    const router = inject(Router);
    const authS = inject(AuthorizationService);
    return authS.authorizationStatus
        .pipe(
            filter(status => typeof status === 'boolean'),
            map(status => !status),
            tap(status => {
                if (!status) { router.navigate(["main"]); }
            }),
          take(1)
        )
}
