import {ChangeDetectionStrategy, Component, Input, OnInit, RendererFactory2, TemplateRef} from '@angular/core';
import {IVidjet} from "../../../../shared/models/entities/Vidjet";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {FormControl} from "@angular/forms";
import {VidjetService} from "../../services/vidjet.service";
import {tap} from "rxjs";
import {CdkDrag} from "@angular/cdk/drag-drop";
import {WidgetService} from "../../../../shared/services/widget.service";

@Component({
  selector: 'app-vidjet-item',
  templateUrl: './vidjet-item.component.html',
  styleUrls: ['./vidjet-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VidjetItemComponent implements OnInit {

  @Input({required: true}) vidjet!: IVidjet;
  protected domainFormControl = new FormControl<string>('');

  protected modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    private vidjetS: VidjetService,
    private widgetS: WidgetService,
  ) {}

  ngOnInit(): void {
    this.domainFormControl.setValue(this.vidjet.domen);
  }

  protected openModal(template: TemplateRef<void>) {
    this.widgetS.show(true);
    this.modalRef = this.modalService.show(template);
    this.modalRef.onHide?.subscribe(() => this.widgetS.show(false));
  }

  protected submitChanges() {
    this.vidjetS.createOrUpdateVidjet({id: this.vidjet.id, domen: this.domainFormControl.value as string })
      .pipe(
        tap(() => this.modalRef?.hide())
      )
      .subscribe();
  }

  protected deleteVidjet() {
    this.vidjetS.deleteVidjet(this.vidjet.id)
      .pipe(
        tap(() => this.modalRef?.hide())
      )
      .subscribe();
  }

  showWidget(show: boolean) {
    this.widgetS.show(show);
  }
}
