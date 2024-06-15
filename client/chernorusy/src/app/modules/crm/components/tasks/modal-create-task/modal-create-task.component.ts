import {ChangeDetectionStrategy, Component, Inject, signal} from '@angular/core';
import {ProfileService} from "../../../../../shared/services/profile.service";
import {filter, map, tap} from "rxjs";
import {AccountRole} from "../../../../profile/enums/AccountRole";
import {IProfileResponseDTO} from "../../../../profile/DTO/response/ProfileResponseDTO";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskService} from "../../../services/task.service";
import {TaskState} from "../../../helpers/enums/TaskState";
import {ITaskCreateOrUpdateDTO} from "../../../helpers/DTO/request/ITaskCreateOrUpdateDTO";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ClientService} from "../../../../../shared/services/client.service";
import {getFio} from "../../../../../shared/helpers/get-fio";
import {ModalCloseTaskCreationComponent} from "../modal-close-task-creation/modal-close-task-creation.component";

@Component({
  selector: 'app-modal-create-task',
  templateUrl: './modal-create-task.component.html',
  styleUrls: ['./modal-create-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalCreateTaskComponent {

  constructor(
    private profileS: ProfileService,
    private taskS: TaskService,
    private clientS: ClientService,
    private matDialogRef: MatDialogRef<any>,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private columnID: string
  ) {}

  protected formGroup = new FormGroup({
    title: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    clientId: new FormControl<string>('', [Validators.required]),
    assignedTo: new FormControl<string>('', [Validators.required]),
    productIds: new FormControl<string[]>([]),
    descrption: new FormControl<string>('')
  })

  protected clients = this.clientS.getEntitiesAsync();
  protected profiles$ = this.profileS.getProfiles$()
    .pipe(
      map(profiles =>
        profiles.items.filter(profile => profile.role === AccountRole.Admin || profile.role === AccountRole.Manager))
    );

  protected attachedProductsListHidden = signal(true);

  createTask() {
    const taskToCreate = {...this.formGroup.value, columnId: this.columnID} as Omit<ITaskCreateOrUpdateDTO, 'id' | 'productIds'>;
    this.taskS.createHTTP$(taskToCreate)
      .pipe(
        tap(() => this.matDialogRef.close())
      )
      .subscribe();
  }

  trackProfile(index: number, profile: IProfileResponseDTO) {
    return profile.id;
  }

  closeModal() {
    this.matDialog.open(ModalCloseTaskCreationComponent, {autoFocus: false})
      .afterClosed()
      .pipe(
        filter(reset => !!reset)
      ).subscribe(() => this.matDialogRef.close())
  }

  protected readonly getFio = getFio;
}
