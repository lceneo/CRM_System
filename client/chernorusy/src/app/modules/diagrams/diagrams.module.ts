import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramsComponent } from './components/diagrams/diagrams.component';
import {
  GridsterComponent,
  GridsterItemComponent,
  GridsterModule,
} from 'angular-gridster2';
import { ComponentLoadComponent } from './components/diagrams/component-load/component-load.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReceivedDialogsOverallModule } from './components/diagrams/modules/received-dialogs-overall/received-dialogs-overall.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { NgxEchartsModule } from 'ngx-echarts';
import { SendMessagesOverallComponent } from './components/diagrams/modules/send-messages-overall/chart/send-messages-overall.component';
import { SendMessagesOverallModule } from './components/diagrams/modules/send-messages-overall/send-messages-overall.module';
import { ReceivedDialogsAndSendMessagesModule } from './components/diagrams/modules/received-dialogs-and-send-messages/received-dialogs-and-send-messages.module';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: DiagramsComponent },
];

@NgModule({
  declarations: [DiagramsComponent, ComponentLoadComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GridsterModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatInputModule,
    ReactiveFormsModule,
    MatMenuModule,

    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    ReceivedDialogsOverallModule,
    SendMessagesOverallModule,
    ReceivedDialogsAndSendMessagesModule,
  ],
})
export class DiagramsModule {}
