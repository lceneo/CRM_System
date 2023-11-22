import {ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";
import {map, Observable, of, switchMap, take, tap} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {ProfileService} from "../../../../shared/services/profile.service";
import {IProfileCreateRequestDTO} from "../../../../shared/models/DTO/request/ProfileCreateRequestDTO";
import {IProfileResponseDTO} from "../../../../shared/models/DTO/response/ProfileResponseDTO";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.component.html',
  styleUrls: ['./manage-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageProfileComponent implements OnInit{

  @Input() mode: 'create' | 'change' | 'observe' = 'observe';
  protected profile$!: Observable<IProfileResponseDTO | null>;

  protected myProfile = this.profileS.profile;

  constructor(
    private profileS: ProfileService,
    private authS: AuthorizationService,
    private route: ActivatedRoute,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  protected form = new FormGroup({
    surname: new FormControl<string>( ''),
    name: new FormControl<string>(''),
    patronimic: new FormControl<string>(''),
    about: new FormControl<string>('')
  });

  ngOnInit(): void {
    this.initProfile();
    if (this.mode === 'observe') { this.form.disable(); }
  }

  private initProfile() {
      this.profile$ = this.mode !== 'create' ? this.route.paramMap
        .pipe(
          map(params => params.get('id') as string),
          switchMap((id) => {
            const myID = this.authS.userID as string;
            if (myID !== id) {
              return this.profileS.getProfile$(id)
              .pipe(
                tap(profile => {
                  if (!profile) { this.router.navigate(["not-found"]); }
                })
              );
            }
            if (this.myProfile()) { return of (this.myProfile()) }
            else {
              this.mode = 'create';
              this.form.enable();
              return of(null);
            } 
          }),
          tap(profile => {
            if (!profile) { return; }
            const profileToSet: Partial<IProfileResponseDTO> = {...profile};
            delete profileToSet.id; delete profileToSet.role;
            //@ts-ignore
            this.form.setValue(profileToSet);
          }),
          takeUntilDestroyed(this.destroyRef)
        ) : of(null);
    }

  protected submitForm() {
    this.profileS.createOrUpdate$(this.form.value as IProfileCreateRequestDTO)
      .subscribe(() => {
        if (this.mode === 'create') { this.router.navigate(['main']) }
      });
  }

  protected changeMode() {
    this.mode = this.mode === 'change' ? 'observe' : 'change';
    if (this.mode === 'observe') { this.form.disable(); }
    else { this.form.enable(); }
  }
}
