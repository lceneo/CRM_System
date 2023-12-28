import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule, Location, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessComponent {

  constructor(private location: Location) {}

  protected stateData?: IStateData = this.location.getState() as IStateData;

}

interface IStateData {
  title: string;
  body: string;
  imgName?: string;
}
