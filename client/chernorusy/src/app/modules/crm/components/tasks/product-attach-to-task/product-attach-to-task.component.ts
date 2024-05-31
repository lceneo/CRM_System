import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ITask} from "../../../helpers/entities/ITask";
import {TaskService} from "../../../services/task.service";

@Component({
  selector: 'app-product-attach-to-task',
  templateUrl: './product-attach-to-task.component.html',
  styleUrls: ['./product-attach-to-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductAttachToTaskComponent {

  constructor(
    private taskS: TaskService,
  ) {}
  @Input({required: true}) set modeInfo(value: IProductAttachToTask) {
    this.mode = value.mode;
    if (value.mode === 'edit') { this.task = this.taskS.getByID(value.taskId!);  }
  }

  protected mode?: 'create' | 'edit';
  protected task?: ITask;
}


export interface IProductAttachToTask {
  mode: 'create' | 'edit';
  taskId?: string;
}
