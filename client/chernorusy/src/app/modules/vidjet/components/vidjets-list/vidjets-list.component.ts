import {ChangeDetectionStrategy, Component} from '@angular/core';
import {VidjetService} from "../../services/vidjet.service";

@Component({
  selector: 'app-vidjets-list',
  templateUrl: './vidjets-list.component.html',
  styleUrls: ['./vidjets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VidjetsListComponent {
  protected vidjets = this.vidjetS.getEntitiesAsync();

  constructor(
    private vidjetS: VidjetService
  ) {}


}
