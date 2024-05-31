import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReceivedDialogsOverallComponent as ReceivedDialogsOverallChartComponent } from './chart/received-dialogs-overall.component';
import { ReceivedDialogsOverallComponent as ReceivedDialogsOverallTableComponent } from './table/received-dialogs-overall.component';
import { ReceivedDialogsOverallComponent as ReceivedDialogsOverallPieComponent } from './pie/received-dialogs-overall.component';
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
    ReceivedDialogsOverallChartComponent,
    ReceivedDialogsOverallTableComponent,
    ReceivedDialogsOverallPieComponent,
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
    ReceivedDialogsOverallChartComponent,
    ReceivedDialogsOverallTableComponent,
    ReceivedDialogsOverallPieComponent,
  ],
})
@ChartDashboardMenu('Статистика диалогов', 'received-dialogs-overall', null, [
  {
    title: 'График',
    dashboardTitle: 'Статистика диалогов (график)',
    component: ReceivedDialogsOverallChartComponent,
  },
  {
    title: 'Таблица',
    dashboardTitle: 'Статистика диалогов (таблица)',
    component: ReceivedDialogsOverallTableComponent,
  },
  {
    title: 'Круговая диаграмма',
    dashboardTitle: 'Статистика диалогов (круговая диаграмма)',
    component: ReceivedDialogsOverallPieComponent,
  },
])
export class ReceivedDialogsOverallModule {}
