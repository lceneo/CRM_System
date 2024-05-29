import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {ColumnService} from "../../services/column.service";

@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrmComponent {
}
