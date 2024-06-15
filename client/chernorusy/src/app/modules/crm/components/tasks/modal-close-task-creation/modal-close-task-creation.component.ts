import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-modal-close-task-creation',
  templateUrl: './modal-close-task-creation.component.html',
  styleUrls: ['./modal-close-task-creation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalCloseTaskCreationComponent {

  constructor(
    private matDialog: MatDialogRef<any>
  ) {}
  resetTaskCreation() {
    this.matDialog.close(true);
  }
}
