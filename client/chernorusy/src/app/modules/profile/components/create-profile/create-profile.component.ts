import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {map, switchMap, take, tap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {TabsetComponent} from "ngx-bootstrap/tabs";
import {ProfileService} from "../../../../shared/services/profile.service";

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProfileComponent implements OnInit {

  @ViewChild('staticTabs') staticTabs?: TabsetComponent;

  protected userID$ = this.activateRoute.paramMap
    .pipe(
      map(params => params.get('id')),
    );

  private checkIDParam = this.userID$.
    pipe(
    tap(id => {
      if (!id) { this.router.navigate(['not-found']); }
    }),
    switchMap(id => this.profileS.getProfile$(id!)),
    tap(profile => {
      if (profile)  { this.router.navigate(['authentication']); }
    }),
    take(1)
  );

  protected passwordSet: boolean = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private profileS: ProfileService
  ) {}

  ngOnInit(): void {
    this.checkIDParam.subscribe();
  }
}
