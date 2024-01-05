import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-image-fullscreen',
  templateUrl: './image-fullscreen.component.html',
  styleUrls: ['./image-fullscreen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageFullscreenComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: IMatDialogData
  ) {}
}

interface IMatDialogData {
  dataUrl: string;
}
