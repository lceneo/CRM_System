import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef
} from '@angular/core';
import {IVidjet} from "../../../../shared/models/entities/Vidjet";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {FormControl} from "@angular/forms";
import {VidjetService} from "../../services/vidjet.service";
import {debounceTime, Subject, tap} from "rxjs";
import {WidgetService} from "../../../../shared/services/widget.service";
import {Customization} from "../../../../../../../../script-builder/customization";
import {cloneDeep, merge, isEqual} from "lodash";

@Component({
  selector: 'app-vidjet-item',
  templateUrl: './vidjet-item.component.html',
  styleUrls: ['./vidjet-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VidjetItemComponent implements OnInit {

  @Input({required: true}) vidjet!: IVidjet;
  protected domainFormControl = new FormControl<string>('');

  get saveDisabled() {
    return this.domainFormControl.value === this.vidjet.domen && !this.stylesChanged;
  };

  private stylesChanged = false;
  applyWidgetStyles = new Subject<void>()

  private widgetStylesInit!: Customization;
  public widgetStyles!: Customization;

  protected modalRef?: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private vidjetS: VidjetService,
    private widgetS: WidgetService,
  ) {
    this.applyWidgetStyles.pipe(debounceTime(300)).subscribe(() => {
      this.widgetS.setStyle(this.widgetStyles)
      this.stylesChanged = !isEqual(this.widgetStyles, this.widgetStylesInit);
    })
  }

  setWidgetStyle(ev: any, ...keys: string[]) {
    const value = ev.target ? ev.target.value : ev;
    let elem: any = this.widgetStyles;
    if (keys.length === 1) {
      elem[keys[0]] = value;
    }
    for (let i = 0; i < keys.length - 1; i++) {
      elem = elem[keys[i]];
    }
    elem[keys[keys.length - 1]] = value;
    this.applyWidgetStyles.next();
  }

  ngOnInit(): void {
    this.domainFormControl.setValue(this.vidjet.domen);
    this.widgetStylesInit = merge(this.vidjet.styles, this.vidjetS.defaultStyles);
    this.widgetStyles = cloneDeep(this.widgetStylesInit);
  }

  protected openModal(template: TemplateRef<void>) {
    this.widgetStyles = cloneDeep(this.widgetStylesInit);
    this.widgetS.setStyle(this.widgetStylesInit);
    this.widgetS.show(true);
    this.modalRef = this.modalService.show(template);
    this.modalRef.onHide?.subscribe(() => this.widgetS.show(false));
  }

  protected submitChanges() {
    this.vidjetS.createOrUpdateVidjet({
      id: this.vidjet.id,
      domen: this.domainFormControl.value as string,
      styles: this.widgetStyles
    })
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
