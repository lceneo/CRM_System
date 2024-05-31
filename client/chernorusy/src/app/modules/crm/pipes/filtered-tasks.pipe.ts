import { Pipe, PipeTransform } from '@angular/core';
import {ITask} from "../helpers/entities/ITask";

@Pipe({
  name: 'filteredTasks',
  standalone: true
})
export class FilteredTasksPipe implements PipeTransform {

  transform(tasks: ITask[], filterOptions: IFilterOptions): ITask[] {
    console.log('мы в tasksFiltered');
    console.log('filters', {
      client: filterOptions.selectedClientOnTaskId,
      assigny: filterOptions.selectedTaskExecutionerId,
      products: filterOptions.selectedProductIds,
    });
    if (filterOptions.selectedClientOnTaskId) {
      tasks = tasks.filter(
        (task) => task.client?.id === filterOptions.selectedClientOnTaskId
      );
    }
    if (filterOptions.selectedTaskExecutionerId) {
      tasks = tasks.filter(
        (task) => task.assignedTo?.id === filterOptions.selectedTaskExecutionerId
      );
    }
    if (filterOptions.selectedProductIds?.length) {
      const productIds = new Set(filterOptions.selectedProductIds);
      tasks = tasks.filter((task) =>
        task.products.some((product) => productIds.has(product.id))
      );
    }
    return [...tasks];
  }
}

export interface IFilterOptions {
  selectedClientOnTaskId: string | null;
  selectedTaskExecutionerId: string | null;
  selectedProductIds: string[] | null;
}
