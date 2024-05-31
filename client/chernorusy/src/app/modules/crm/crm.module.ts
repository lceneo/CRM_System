import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CrmComponent } from './components/crm/crm.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TasksDashboardComponent } from './components/tasks/tasks-dashboard/tasks-dashboard.component';
import { TaskItemComponent } from './components/tasks/task-item/task-item.component';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ModalDeleteTaskComponent } from './components/tasks/modal-delete-task/modal-delete-task.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModalCreateTaskComponent } from './components/tasks/modal-create-task/modal-create-task.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaResizeDirective } from '../../shared/directives/textarea-resize.directive';
import { MatSelectModule } from '@angular/material/select';
import { ModalTaskInfoComponent } from './components/tasks/modal-task-info/modal-task-info.component';
import { NgLetDirective } from '../../shared/directives/ng-let.directive';
import { MatBadgeModule } from '@angular/material/badge';
import { TaskCommentComponent } from './components/tasks/comments/task-comment/task-comment.component';
import { ModalDeleteTaskCommentComponent } from './components/tasks/comments/modal-delete-task-comment/modal-delete-task-comment.component';
import { ProductsTableComponent } from './components/products/products-table/products-table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TasksByColumnPipe } from './pipes/tasks-by-column.pipe';
import { ModalCreateUpdateProductComponent } from './components/products/modal-create-update-product/modal-create-update-product.component';
import { ModalDeleteProductComponent } from './components/products/modal-delete-product/modal-delete-product.component';
import { ModalCreateUpdateColumnComponent } from './components/tasks/modal-create-update-column/modal-create-update-column.component';
import { ModalDeleteColumnComponent } from './components/tasks/modal-delete-column/modal-delete-column.component';
import { AutoTextColorDirective } from 'src/app/shared/directives/autoTextColor.directive';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: CrmComponent },
];

@NgModule({
  declarations: [
    CrmComponent,
    TasksDashboardComponent,
    TaskItemComponent,
    ModalDeleteTaskComponent,
    ModalCreateTaskComponent,
    ModalTaskInfoComponent,
    TaskCommentComponent,
    ModalDeleteTaskCommentComponent,
    ProductsTableComponent,
    ModalCreateUpdateProductComponent,
    ModalDeleteProductComponent,
    ModalCreateUpdateColumnComponent,
    ModalDeleteColumnComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatInputModule,
    FormsModule,
    TextareaResizeDirective,
    MatSelectModule,
    ReactiveFormsModule,
    NgLetDirective,
    MatBadgeModule,
    NgxDatatableModule,
    TasksByColumnPipe,
    AutoTextColorDirective,
    NgSelectModule,
  ],
})
export class CrmModule {}
