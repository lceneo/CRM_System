import {ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";
import {BehaviorSubject, debounceTime, map, Observable, of, switchMap, take, tap} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ProfileService} from "../../../../shared/services/profile.service";
import {IProfileCreateRequestDTO} from "../../../../shared/models/DTO/request/ProfileCreateRequestDTO";
import {IProfileResponseDTO} from "../../../../shared/models/DTO/response/ProfileResponseDTO";
import {AuthorizationService} from "../../../../shared/services/authorization.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MyValidatorsService} from "../../../../shared/services/my-validators.service";

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
  protected savedProfileJson?: string;

  protected infoHasChanged$ = new BehaviorSubject(false);

  constructor(
    private profileS: ProfileService,
    private authS: AuthorizationService,
    private myValidatorS: MyValidatorsService,
    private route: ActivatedRoute,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  protected form = new FormGroup({
    surname: new FormControl<string>( '', [Validators.required, this.myValidatorS.minMaxLengthValidator(2, 30)]),
    name: new FormControl<string>('', [Validators.required, this.myValidatorS.minMaxLengthValidator(2, 30)]),
    patronimic: new FormControl<string>(''),
    about: new FormControl<string>('')
  });

  ngOnInit(): void {
    this.initProfile();
    if (this.mode === 'observe') {
      this.form.disable();
    }
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
            this.setExistingProfile(profile);
          }),
          takeUntilDestroyed(this.destroyRef)
        ) : of(null);
    }

  protected submitForm() {
    this.profileS.createOrUpdate$(this.form.value as IProfileCreateRequestDTO)
      .subscribe(() => {
        if (this.mode === 'create') { this.router.navigate(['main']) }
        else if (this.mode === 'change') { this.changeMode(); this.savedProfileJson = JSON.stringify(this.form.value) }
      });
  }

  protected changeMode() {
    this.mode = this.mode === 'change' ? 'observe' : 'change';
    if (this.mode === 'observe') {
      this.form.disable();
      this.form.setValue({
        about: this.myProfile()?.about ?? '',
        name: this.myProfile()?.name ?? '',
        patronimic: this.myProfile()?.patronimic ?? '',
        surname: this.myProfile()?.surname ?? ''
      })
    }
    else { this.form.enable(); }
  }

  protected setExistingProfile(profile: IProfileResponseDTO) {
    const profileToSet: Partial<IProfileResponseDTO> = {...profile};
    delete profileToSet.id; delete profileToSet.role;
    Object.keys(profileToSet).forEach(key => {
      // @ts-ignore
      if (profileToSet[key] === undefined || profileToSet[key] === null) {
        // @ts-ignore
        profileToSet[key] = '';
      }
    })
    //@ts-ignore
    this.form.setValue(profileToSet);
    this.savedProfileJson = JSON.stringify(profileToSet);

    this.form.valueChanges
      .pipe(
        debounceTime(100),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(value => {
        if (this.form.valid) {
          const formJson = JSON.stringify(value);
          const infoChanged = formJson !== this.savedProfileJson;
          this.infoHasChanged$.next(infoChanged);
        }
    })
  }
}
