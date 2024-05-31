import { ChangeDetectorRef, computed } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TaskState } from '../../../helpers/enums/TaskState';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskService } from '../../../services/task.service';
import { ITask } from '../../../helpers/entities/ITask';
import { ColumnService } from '../../../services/column.service';
import { ModalCreateUpdateProductComponent } from '../../products/modal-create-update-product/modal-create-update-product.component';
import { ModalDeleteProductComponent } from '../../products/modal-delete-product/modal-delete-product.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalCreateUpdateColumnComponent } from '../modal-create-update-column/modal-create-update-column.component';
import { ProductService } from '../../../services/product.service';
import { IProduct } from '../../../helpers/entities/IProduct';
import { getFio } from 'src/app/shared/helpers/get-fio';
import { IProfileResponseDTO } from 'src/app/modules/profile/DTO/response/ProfileResponseDTO';
import { Client, ClientService } from 'src/app/shared/services/client.service';
import { map, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProfileService } from 'src/app/shared/services/profile.service';

@Component({
  selector: 'app-tasks-dashboard',
  templateUrl: './tasks-dashboard.component.html',
  styleUrls: ['./tasks-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksDashboardComponent {
  constructor(
    private columnS: ColumnService,
    private taskS: TaskService,
    private matDialog: MatDialog,
    private productS: ProductService,
    private clientS: ClientService,
    private profileS: ProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  protected columns = this.columnS.getEntitiesSortedAsync();
  doFilter$ = new Subject<void>();

  tasks = this.taskS.getEntitiesAsync();

  clientsOnTasks = computed(() => {
    const clientIds = new Set<string>();
    return this.tasks()
      ?.map((task) => task.client)
      .filter(Boolean)
      .filter((client) => {
        if (clientIds.has(client.id)) {
          return false;
        }
        clientIds.add(client.id);
        return true;
      });
  });
  taskExecutioners = computed(() => {
    const executionersIds = new Set<string>();
    return this.tasks()
      ?.map((task) => task.assignedTo)
      .filter(Boolean)
      .filter((profile) => {
        if (executionersIds.has(profile.id)) {
          return false;
        }
        executionersIds.add(profile.id);
        return true;
      });
  });
  products = this.productS.getEntitiesAsync();
  productsOnTasks = computed(() => {
    const productIds = new Set<string>();
    return this.tasks()
      ?.flatMap((task) => task.products)
      .filter(Boolean)
      .filter((product) => {
        if (productIds.has(product.id)) {
          return false;
        }
        productIds.add(product.id);
        return true;
      });
  });

  executionerSearchFn = (term: string, item: IProfileResponseDTO) => {
    term = term.trim();
    return (
      item.name.startsWith(term) ||
      item.surname.startsWith(term) ||
      item.patronimic?.startsWith?.(term)
    );
  };
  clientSearchFn = (term: string, item: Client) => {
    term = term.trim();
    return (
      item.name?.startsWith?.(term) ||
      item.surname?.startsWith?.(term) ||
      item.patronymic?.startsWith?.(term)
    );
  };

  selectedClientOnTaskId: string | null = null;
  selectedClientOnTaskIdName = computed(() => {
    if (
      !this.selectedClientOnTaskId ||
      !this.clientS.getByID(this.selectedClientOnTaskId)
    ) {
      return null;
    }
    return getFio(this.clientS.getByID(this.selectedClientOnTaskId)!);
  });
  selectedTaskExecutionerId: string | null = null;
  selectedTaskExecutionerIdName = computed(() => {
    if (!this.selectedTaskExecutionerId) {
      return null;
    }
    const taskWithProfile = this.tasks()?.find(
      (task) => task.assignedTo?.id === this.selectedTaskExecutionerId
    );
    if (!taskWithProfile) {
      return null;
    }
    return getFio(taskWithProfile.assignedTo);
  });
  selectedProductIds: string[] = [];

  dropTask(event: CdkDragDrop<ITask[]>, newColumnId: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.taskS
        .updateHTTP$({ id: event.item.data.id, columnId: newColumnId })
        .subscribe();
    }
  }

  openCreateColumnModal() {
    this.matDialog.open(ModalCreateUpdateColumnComponent, {
      data: { mode: 'create' },
      autoFocus: false,
    });
  }

  openUpdateColumnModal(columnId: string) {
    this.matDialog.open(ModalCreateUpdateColumnComponent, {
      data: { mode: 'edit', columnId },
      autoFocus: false,
    });
  }

  openDeleteColumnModal(columnId: string) {
    this.matDialog.open(ModalDeleteProductComponent, {
      data: columnId,
      autoFocus: false,
    });
  }

  protected readonly TaskState = TaskState;
  protected readonly getFio = getFio;
}
