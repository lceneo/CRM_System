import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import { CrmComponent } from './components/crm/crm.component';
import {MatTabsModule} from "@angular/material/tabs";
import { TasksDashboardComponent } from './components/tasks-dashboard/tasks-dashboard.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import {CdkDrag, CdkDropList, CdkDropListGroup} from "@angular/cdk/drag-drop";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import { ModalDeleteTaskComponent } from './components/modal-delete-task/modal-delete-task.component';
import {MatDialogModule} from "@angular/material/dialog";


const routes: Routes =
[
  { path: '', pathMatch: "full", component: CrmComponent }
]

@NgModule({
  declarations: [
    CrmComponent,
    TasksDashboardComponent,
    TaskItemComponent,
    ModalDeleteTaskComponent
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
        MatDialogModule
    ]
})
export class CrmModule { }
