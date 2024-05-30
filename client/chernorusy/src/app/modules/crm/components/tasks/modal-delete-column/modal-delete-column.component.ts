import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {tap} from "rxjs";
import {ColumnService} from "../../../services/column.service";

@Component({
  selector: 'app-modal-delete-column',
  templateUrl: './modal-delete-column.component.html',
  styleUrls: ['./modal-delete-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDeleteColumnComponent {
  constructor(
    private columnS: ColumnService,
    private matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected columnId: string,
  ) {}

  protected column = this.columnS.getByID(this.columnId);
  deleteColumn() {
    this.columnS.deleteByIDHTTP$(this.columnId)
      .pipe(
        tap(() => this.matDialogRef.close())
      )
      .subscribe();
  }
}
