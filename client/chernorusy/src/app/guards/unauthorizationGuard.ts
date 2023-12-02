import {inject} from "@angular/core";
import {AuthorizationService} from "../shared/services/authorization.service";
import {map, take, tap} from "rxjs";
import {Router} from "@angular/router";

export const unauthorizationGuard = () => {
    const router = inject(Router);
    const authS = inject(AuthorizationService);
    return authS.authorizationStatus
        .pipe(
            take(1),
            map(status => !status),
            tap(status => {
                if (!status) { router.navigate(["main"]); }
            })
        )
}
