import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Router} from "@angular/router";
import {map} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {ProfileService} from "../../../../shared/services/profile.service";
import {IProfileCreateRequestDTO} from "../../../../shared/models/DTO/request/ProfileCreateRequestDTO";

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateProfileComponent {

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
