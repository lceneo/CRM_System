import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReceivedDialogsAndSendMessagesComponent as ReceivedDialogsAndSendMessagesHistogramComponent } from './histogram/received-dialogs-and-send-messages.component';
import { ExternalComponents } from 'src/app/shared/decorators/external-components';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { ChartDashboardMenu } from '../../charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [ReceivedDialogsAndSendMessagesHistogramComponent],
  imports: [
    CommonModule,
    NgxEchartsModule.forChild(),
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    NgxDatatableModule,
  ],
  providers: [DatePipe],
  exports: [ReceivedDialogsAndSendMessagesHistogramComponent],
})
@ChartDashboardMenu(
  'Соотношение диалогов и сообщений',
  'received-dialogs-and-send-messages',
  null,
  [
    {
      title: 'Гистограма',
      dashboardTitle: 'Соотношение диалогов и сообщений (график)',
      component: ReceivedDialogsAndSendMessagesHistogramComponent,
    },
  ]
)
export class ReceivedDialogsAndSendMessagesModule {}
