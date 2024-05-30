import {ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable, tap} from "rxjs";
import {IProductCreateOrUpdateDTO} from "../../../helpers/DTO/request/IProductCreateOrUpdateDTO";
import {ColumnService} from "../../../services/column.service";
import {IColumnCreateOrUpdateDTO} from "../../../helpers/DTO/request/IColumnCreateOrUpdateDTO";
import {IColumn} from "../../../helpers/entities/IColumn";
import {max} from "lodash";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-modal-create-update-column',
  templateUrl: './modal-create-update-column.component.html',
  styleUrls: ['./modal-create-update-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalCreateUpdateColumnComponent implements OnInit {
  constructor(
    private columnS: ColumnService,
    private matDialogRef: MatDialogRef<any>,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) protected columnData: IColumnCreateOrUpdateModal
  ) {}

  protected formGroup = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    color: new FormControl<string>('#ecf0f3', [Validators.required])
  })

  protected color = signal('#ecf0f3');
  protected header?: string;
  protected btnSubmitText?: string;
  ngOnInit() {
    this.setHeaderAndBtnSubmitText(this.columnData);
    if (this.columnData.mode === 'edit') { this.setInitialFormValue(this.columnData.columnId!); }
    this.listenForColorChanges();
  }

  createOrUpdateColumn() {
    let obs: Observable<any>;
    if (this.columnData.mode === 'create') {
      const orderArr = this.columnS.getEntitiesSync().map(column => column.order);
      const currentMaxOrder = max(orderArr) ?? -1;
      obs = this.columnS.createHTTP$({
        order: currentMaxOrder + 1,
        ...this.formGroup.value as Omit<IColumnCreateOrUpdateDTO, "id" | 'order'>
      })
    } else {
      obs = this.columnS.updateHTTP$({
        id: this.columnData.columnId,
        ...this.formGroup.value as Omit<IProductCreateOrUpdateDTO, "id">
      });
    }
    obs
      .pipe(
        tap(() => this.matDialogRef.close())
      ).subscribe();
  }

  private setHeaderAndBtnSubmitText(modalData: IColumnCreateOrUpdateModal) {
    if (modalData.mode === 'edit') {
      this.header = 'Изменить колонку';
      this.btnSubmitText = 'Сохранить';
    } else {
      this.header = 'Новая колонка';
      this.btnSubmitText = 'Создать'
    }
  }

  private setInitialFormValue(columnId: string) {
    const column = this.columnS.getByID(columnId) as IColumn;
    this.formGroup.setValue({name: column.name, color: column.color}, {emitEvent: false});
    if (column.color) { this.color.set(column.color); }
  }

  private listenForColorChanges() {
    this.formGroup.controls.color
      .valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(color => this.color.set(color as string));
  }
}

export interface IColumnCreateOrUpdateModal {
  columnId?: string;
  mode: 'edit' | 'create';
}
