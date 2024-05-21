import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReceivedDialogsOverallComponent } from './chart/received-dialogs-overall.component';
import { ExternalComponents } from 'src/app/shared/decorators/external-components';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { ChartDashboardMenu } from '../../charts';

@NgModule({
  declarations: [ReceivedDialogsOverallComponent],
  imports: [
    CommonModule,
    NgxEchartsModule.forChild(),
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  providers: [DatePipe],
  exports: [ReceivedDialogsOverallComponent],
})
@ExternalComponents(ReceivedDialogsOverallComponent)
@ChartDashboardMenu('Статистика диалогов', 'received-dialogs-overall', null, [
  {
    title: 'График',
    dashboardTitle: 'Статистика диалогов (график)',
    component: ReceivedDialogsOverallComponent,
  },
  {
    title: 'Таблица',
    dashboardTitle: 'Статистика диалогов (таблица)',
    component: ReceivedDialogsOverallComponent,
  },
])
export class ReceivedDialogsOverallModule {}
