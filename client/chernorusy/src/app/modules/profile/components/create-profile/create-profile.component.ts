import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {map} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {TabsetComponent} from "ngx-bootstrap/tabs";

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProfileComponent {

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
