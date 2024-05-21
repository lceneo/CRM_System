import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceivedDialogsOverallComponent } from './received-dialogs-overall.component';
import { ExternalComponents } from 'src/app/shared/decorators/external-components';

@NgModule({
  declarations: [ReceivedDialogsOverallComponent],
  imports: [CommonModule],
  exports: [ReceivedDialogsOverallComponent],
})
@ExternalComponents(ReceivedDialogsOverallComponent)
export class ReceivedDialogsOverallModule {}
