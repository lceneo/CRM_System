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
import {ClientService} from "../../../../../shared/services/client.service";
import {getFio} from "../../../../../shared/helpers/get-fio";


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
    private clientS: ClientService,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) protected taskId: string
  ) {}


  protected task = this.taskS.getEntityAsync(this.taskId);
  protected comments = computed(() =>
      this.taskS.getTaskCommentsAsync(this.taskId)()?.sort((f, s) => new Date(f.createdAt).getTime() - new Date(s.createdAt).getTime()) as IComment[]);
  protected clients = this.clientS.getEntitiesAsync();

  protected savedFormValue = computed(() => {
    const currentTaskState = this.task();
    return {
      title: currentTaskState?.title,
      assignedTo: currentTaskState?.assignedTo.id,
      clientId: currentTaskState?.client.id,
      productIds: currentTaskState?.products.map(prod => prod.id),
      descrption: currentTaskState?.descrption}
  })

  // @ts-ignore
  protected effectChangegFormValue = effect(() => this.formGroup.setValue(this.savedFormValue()), {allowSignalWrites: true})

  protected formGroup = new FormGroup({
    title: new FormControl<string>((this.task())?.title ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    assignedTo: new FormControl<string>((this.task())?.assignedTo.id ?? '', [Validators.required]),
    clientId:  new FormControl<string>((this.task())?.client.id ?? '', [Validators.required]),
    productIds:  new FormControl<string[]>(this.task()?.products.map(prod => prod.id) ?? []),
    descrption: new FormControl<string>((this.task())?.descrption ?? '')
  })

  protected commentControl = new FormControl<string>('', Validators.minLength(1));

  protected profiles$ = this.profileS.getProfiles$()
    .pipe(
      map(profiles =>
        profiles.items.filter(profile => profile.role === AccountRole.Admin || profile.role === AccountRole.Manager))
    );

  protected currentMode: WritableSignal<TaskInfoMod> = signal('view');
  protected saveChangesBtnDisabled = signal(true);
  protected attachedProductsListHidden = signal(true);


  ngOnInit(): void {
    this.formGroup.disable();
    this.listenFormChanges();
  }

  protected changeMod() {
    if (this.currentMode() === 'view') {
      this.currentMode.set('edit');
      this.formGroup.enable();
    } else {
      this.currentMode.set('view');
      //@ts-ignore
      this.formGroup.setValue(this.savedFormValue());
      this.formGroup.disable();
    }
  }

  protected saveChanges() {
    const updatedTask = {...this.formGroup.value, id: this.taskId} as Partial<ITaskCreateOrUpdateDTO>
    this.taskS.updateHTTP$(updatedTask)
        .pipe(
            tap(() => this.changeMod())
        )
        .subscribe();
  }
  protected postComment() {
    if (this.commentControl.valid && this.commentControl.value) {
        this.taskS.postCommentHTTP$(this.taskId, {text: this.commentControl.value})
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

  protected readonly getFio = getFio;
}

interface ITaskInfoData {
  taskID: string;
  header: string;
}

type TaskInfoMod = 'view' | 'edit';
