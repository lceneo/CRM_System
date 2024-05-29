import {computed, Pipe, PipeTransform, Signal} from '@angular/core';
import {ITask} from "../helpers/entities/ITask";
import {TaskService} from "../services/task.service";

@Pipe({
  name: 'tasksByColumn',
  standalone: true
})
export class TasksByColumnPipe implements PipeTransform {

  constructor(
    private taskS: TaskService
  ) {}
  transform(columnID: string): Signal<ITask[]> {
    return computed(() => this.taskS.getEntitiesAsync(task => task.column.id === columnID)());
  }

}
