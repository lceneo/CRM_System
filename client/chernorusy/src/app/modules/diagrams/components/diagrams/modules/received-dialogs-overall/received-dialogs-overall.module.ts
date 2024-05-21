import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReceivedDialogsOverallComponent } from './received-dialogs-overall.component';
import { ExternalComponents } from 'src/app/shared/decorators/external-components';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

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
export class ReceivedDialogsOverallModule {}
