import {ChangeDetectionStrategy, Component} from '@angular/core';
import {map} from "rxjs";
import {ProfileService} from "../../../../shared/services/profile.service";
import {Router} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {IProfileCreateRequestDTO} from "../../../../shared/models/DTO/request/ProfileCreateRequestDTO";

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileInfoComponent {
  protected userID$ = this.router.routerState.root.paramMap
    .pipe(
      map(params => params.get('id'))
    );
  constructor(
    private profileS: ProfileService,
    private router: Router
  ) {}

  protected form = new FormGroup({
    surname: new FormControl<string>(''),
    name: new FormControl<string>(''),
    patronimic: new FormControl<string>(''),
    about: new FormControl<string>('')
  });

  submitForm() {
    this.profileS.create$(this.form.value as IProfileCreateRequestDTO)
      .subscribe(() => this.router.navigate(['main']));
  }
}
