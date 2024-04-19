import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef, effect,
  Inject,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ProfileService} from "../../../../../shared/services/profile.service";
import {IProfileResponseDTO} from "../../../../profile/DTO/response/ProfileResponseDTO";
import {combineLatest, map, tap} from "rxjs";
import {AccountRole} from "../../../../profile/enums/AccountRole";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskService} from "../../../services/task.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ITaskCreateOrUpdateDTO} from "../../../helpers/DTO/request/ITaskCreateOrUpdateDTO";
import {IComment} from "../../../helpers/entities/IComment";


@Component({
  selector: 'app-modal-task-info',
  templateUrl: './modal-task-info.component.html',
  styleUrls: ['./modal-task-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalTaskInfoComponent implements OnInit {
  constructor(
    private profileS: ProfileService,
    private taskS: TaskService,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) protected taskInfo: ITaskInfoData
  ) {}


  protected task = this.taskS.getEntityAsync(this.taskInfo.taskID);
  protected comments = computed(() =>
      this.taskS.getTaskCommentsAsync(this.taskInfo.taskID)()?.sort((f, s) => new Date(f.createdAt).getTime() - new Date(s.createdAt).getTime()) as IComment[]);

  protected savedFormValue = computed(() => {
    const currentTaskState = this.task();
    return {title: currentTaskState?.title, assignedTo: currentTaskState?.assignedTo.id, descrption: currentTaskState?.descrption}
  })

  // @ts-ignore
  protected effectChangegFormValue = effect(() => this.formGroup.setValue(this.savedFormValue()), {allowSignalWrites: true})

  protected formGroup = new FormGroup({
    title: new FormControl<string>((this.task())?.title ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    assignedTo: new FormControl<string>((this.task())?.assignedTo.id ?? '', [Validators.required]),
    descrption: new FormControl<string>((this.task())?.descrption ?? '', [Validators.required, Validators.minLength(5), Validators.maxLength(255)])
  })

  protected commentControl = new FormControl<string>('', Validators.minLength(1));

  protected profiles$ = this.profileS.getProfiles$()
    .pipe(
      map(profiles =>
        profiles.filter(profile => profile.role === AccountRole.Admin || profile.role === AccountRole.Manager))
    );

  protected currentMod: WritableSignal<TaskInfoMod> = signal('view');
  protected saveChangesBtnDisabled = signal(true);
  protected profileID = this.profileS.profile()?.id;

  ngOnInit(): void {
    this.formGroup.disable();
    this.listenFormChanges();
  }

  protected changeMod() {
    if (this.currentMod() === 'view') {
      this.currentMod.set('edit');
      this.formGroup.enable();
    } else {
      this.currentMod.set('view');
      //@ts-ignore
      this.formGroup.setValue(this.savedFormValue());
      this.formGroup.disable();
    }
  }

  protected saveChanges() {
    const updatedTask = {...this.formGroup.value, id: this.taskInfo.taskID} as Partial<ITaskCreateOrUpdateDTO>
    this.taskS.updateHTTP$(updatedTask)
        .pipe(
            tap(() => this.changeMod())
        )
        .subscribe();
  }
  protected postComment() {
    if (this.commentControl.valid && this.commentControl.value) {
        this.taskS.postComment$(this.taskInfo.taskID, {text: this.commentControl.value})
            .pipe(
                tap(() => this.commentControl.setValue(''))
            )
            .subscribe()
    }
  }
  protected pressKey(ev: KeyboardEvent) {
    (ev.key === 'Enter' && ev.ctrlKey) && this.postComment();
  }
  protected trackProfile(index: number, profile: IProfileResponseDTO) {
    return profile.id;
  }

  private listenFormChanges() {
    //для разблокирования/блока кнопки сохранения изменений
    combineLatest([
        this.formGroup.statusChanges,
        this.formGroup.valueChanges
        ]
    )
      .pipe(
          tap(([status, formValue]) =>
              this.saveChangesBtnDisabled.set(status !== 'VALID' || JSON.stringify(formValue) === JSON.stringify(this.savedFormValue()))),
          takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}

interface ITaskInfoData {
  taskID: string;
  header: string;
}

type TaskInfoMod = 'view' | 'edit';
