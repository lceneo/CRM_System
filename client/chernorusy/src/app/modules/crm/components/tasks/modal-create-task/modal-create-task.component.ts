import {ChangeDetectionStrategy, Component, Inject, signal} from '@angular/core';
import {ProfileService} from "../../../../../shared/services/profile.service";
import {map, tap} from "rxjs";
import {AccountRole} from "../../../../profile/enums/AccountRole";
import {IProfileResponseDTO} from "../../../../profile/DTO/response/ProfileResponseDTO";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskService} from "../../../services/task.service";
import {TaskState} from "../../../helpers/enums/TaskState";
import {ITaskCreateOrUpdateDTO} from "../../../helpers/DTO/request/ITaskCreateOrUpdateDTO";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ClientService} from "../../../../../shared/services/client.service";
import {getFio} from "../../../../../shared/helpers/get-fio";

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
    @Inject(MAT_DIALOG_DATA) private columnID: string
  ) {}

  protected formGroup = new FormGroup({
    title: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    clientId: new FormControl<string>('', [Validators.required]),
    assignedTo: new FormControl<string>('', [Validators.required]),
    productIds: new FormControl<string[]>([]),
    descrption: new FormControl<string>('', [Validators.required, Validators.minLength(5), Validators.maxLength(255)])
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

  protected readonly getFio = getFio;
}
