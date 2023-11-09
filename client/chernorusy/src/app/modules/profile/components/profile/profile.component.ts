import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {map} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {TabsetComponent} from "ngx-bootstrap/tabs";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {

  @ViewChild('staticTabs') staticTabs?: TabsetComponent;

  protected userID$ = this.activateRoute.paramMap
    .pipe(
      map(params => params.get('id'))
    );

  protected passwordSet: boolean = false;

  constructor(
    private activateRoute: ActivatedRoute
  ) {}
}
