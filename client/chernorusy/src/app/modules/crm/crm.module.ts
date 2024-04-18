import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import { CrmComponent } from './components/crm/crm.component';
import {MatTabsModule} from "@angular/material/tabs";
import { TasksDashboardComponent } from './components/tasks/tasks-dashboard/tasks-dashboard.component';
import { TaskItemComponent } from './components/tasks/task-item/task-item.component';
import {CdkDrag, CdkDropList, CdkDropListGroup} from "@angular/cdk/drag-drop";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import { ModalDeleteTaskComponent } from './components/tasks/modal-delete-task/modal-delete-task.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatTooltipModule} from "@angular/material/tooltip";
import { ModalCreateTaskComponent } from './components/tasks/modal-create-task/modal-create-task.component';
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TextareaResizeDirective} from "../../shared/directives/textarea-resize.directive";
import {MatSelectModule} from "@angular/material/select";
import { ModalTaskInfoComponent } from './components/tasks/modal-task-info/modal-task-info.component';
import {NgLetDirective} from "../../shared/directives/ng-let.directive";
import {MatBadgeModule} from "@angular/material/badge";


const routes: Routes =
[
  { path: '', pathMatch: "full", component: CrmComponent }
]

@NgModule({
  declarations: [
    CrmComponent,
    TasksDashboardComponent,
    TaskItemComponent,
    ModalDeleteTaskComponent,
    ModalCreateTaskComponent,
    ModalTaskInfoComponent
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
        MatBadgeModule
    ]
})
export class CrmModule { }
