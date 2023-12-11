import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {VidjetService} from "../../services/vidjet.service";
import {tap} from "rxjs";
import {AccordionPanelComponent} from "ngx-bootstrap/accordion";

@Component({
  selector: 'app-vidjet-create',
  templateUrl: './vidjet-create.component.html',
  styleUrls: ['./vidjet-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VidjetCreateComponent {
  protected domainFormControl = new FormControl<string>('', [Validators.required]);

  @ViewChild(AccordionPanelComponent, {static: true}) accordionPanel!: AccordionPanelComponent;

  constructor(
    private vidjetS: VidjetService
  ) {}

  protected createVidjet() {
    this.vidjetS.createOrUpdateVidjet({domen: this.domainFormControl.value?.trim() as string})
      .pipe(
        tap(() => {
          if (this.accordionPanel.isOpen) { this.accordionPanel.toggleOpen(); }
        })
      ).subscribe();
  }
}
