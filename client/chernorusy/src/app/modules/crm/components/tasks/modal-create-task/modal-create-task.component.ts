import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {ProfileService} from "../../../../../shared/services/profile.service";
import {map, tap} from "rxjs";
import {AccountRole} from "../../../../profile/enums/AccountRole";
import {IProfileResponseDTO} from "../../../../profile/DTO/response/ProfileResponseDTO";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskService} from "../../../services/task.service";
import {TaskState} from "../../../helpers/enums/TaskState";
import {ITaskCreateOrUpdateDTO} from "../../../helpers/DTO/request/ITaskCreateOrUpdateDTO";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

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
    private matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) private taskState: TaskState
  ) {}

  protected formGroup = new FormGroup({
    title: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    assignedTo: new FormControl<string>('', [Validators.required]),
    descrption: new FormControl<string>('', [Validators.required, Validators.minLength(5), Validators.maxLength(255)])
  })

  protected profiles$ = this.profileS.getProfiles$()
    .pipe(
      map(profiles =>
        profiles.filter(profile => profile.role === AccountRole.Admin || profile.role === AccountRole.Manager))
    );

  createTask() {
    const taskToCreate = {...this.formGroup.value, state: this.taskState} as Omit<ITaskCreateOrUpdateDTO, 'id' | 'productIds'>;
    this.taskS.createHTTP$(taskToCreate)
      .pipe(
        tap(() => this.matDialogRef.close())
      )
      .subscribe();
  }

  trackProfile(index: number, profile: IProfileResponseDTO) {
    return profile.id;
  }
}
