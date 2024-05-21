import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-modal-delete-task-comment',
  templateUrl: './modal-delete-task-comment.component.html',
  styleUrls: ['./modal-delete-task-comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDeleteTaskCommentComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) protected commentID: string,
    private matDialogRef: MatDialogRef<any>
  ) {}

  protected deleteComment() {
    this.matDialogRef.close(true);
  }
}
