import {ChangeDetectionStrategy, Component} from '@angular/core';
import {VidjetService} from "../../services/vidjet.service";
import {WidgetService} from "../../../../shared/services/widget.service";

@Component({
  selector: 'app-vidjets-list',
  templateUrl: './vidjets-list.component.html',
  styleUrls: ['./vidjets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VidjetsListComponent {
  protected vidjets = this.vidjetS.getEntitiesAsync();

  constructor(
    private vidjetS: VidjetService,
    private widgetS: WidgetService,
  ) {
    widgetS.show(false);
  }


}
