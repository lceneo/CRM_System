import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SendMessagesOverallComponent as SendMessagesOverallChartComponent } from './chart/send-messages-overall.component';
import { SendMessagesOverallComponent as SendMessagesOverallTableComponent } from './table/send-messages-overall.component';
import { ExternalComponents } from 'src/app/shared/decorators/external-components';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { ChartDashboardMenu } from '../../charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [
    SendMessagesOverallChartComponent,
    SendMessagesOverallTableComponent,
  ],
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
  exports: [
    SendMessagesOverallChartComponent,
    SendMessagesOverallTableComponent,
  ],
})
@ChartDashboardMenu('Статистика сообщений', 'send-messages-overall', null, [
  {
    title: 'График',
    dashboardTitle: 'Статистика сообщений (график)',
    component: SendMessagesOverallChartComponent,
  },
  {
    title: 'Таблица',
    dashboardTitle: 'Статистика сообщений (таблица)',
    component: SendMessagesOverallTableComponent,
  },
])
export class SendMessagesOverallModule {}
