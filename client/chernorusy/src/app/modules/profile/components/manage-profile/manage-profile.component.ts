import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {map} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {ProfileService} from "../../../../shared/services/profile.service";
import {IProfileCreateRequestDTO} from "../../../../shared/models/DTO/request/ProfileCreateRequestDTO";

@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.component.html',
  styleUrls: ['./manage-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageProfileComponent implements OnInit{

  @Input() mode: 'create' | 'change' | 'observe' = 'observe';

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

  ngOnInit(): void {
    if (this.mode === 'observe') { this.form.disable(); }
  }
  protected submitForm() {
    this.profileS.create$(this.form.value as IProfileCreateRequestDTO)
      .subscribe(() => this.router.navigate(['main']));
  }

  protected changeMode() {
    this.mode = this.mode === 'change' ? 'observe' : 'change';
    if (this.mode === 'observe') { this.form.disable(); }
    else { this.form.enable(); }
  }
}
