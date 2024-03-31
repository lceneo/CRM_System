import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef
} from '@angular/core';
import {IVidjet} from "../../entities/Vidjet";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {FormControl} from "@angular/forms";
import {VidjetService, Customization} from "../../services/vidjet.service";
import {debounceTime, Subject, tap} from "rxjs";
import {WidgetService} from "../../../../shared/services/widget.service";
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

  ngOnInit(): void {
    this.domainFormControl.setValue(this.vidjet.domen);
    this.widgetStylesInit = merge(this.vidjet.styles, this.vidjetS.defaultStyles);
    this.widgetStyles = cloneDeep(this.widgetStylesInit);
  }

  getPadding(s: string, type: 'top' | 'left' | 'bottom' | 'right') {
    const index = this.getPaddingIndex(type);
    const v = this.toFullPadding(s.split(' '))[index];
    if (!v || !v.endsWith('px')) return 0;
    return v.slice(0, v.length - 2);
  }

  newPadding(before: string, type: 'top' | 'left' | 'bottom' | 'right', value: number) {
    const values = this.toFullPadding(before.split(' '));
    const index = this.getPaddingIndex(type);
    values[index] = value + 'px';
    return values.join(' ');
  }

  private toFullPadding(p: string[]) {
    if (p.length === 1) {
      p.push(p[0]);
      p.push(p[0]);
      p.push(p[0]);
    }
    if (p.length === 2) {
      p.push(p[0]);
      p.push(p[0])
    }
    if (p.length === 3) {
      p.push(p[1]);
    }
    return p;
  }

  private getPaddingIndex(type: 'left' | 'right' | 'top' | 'bottom'): number {
    let index = 0;
    switch(type) {
      case "left":
        index = 3;
        break;
      case "top":
        index = 0;
        break;
      case "right":
        index = 1;
        break;
      case "bottom":
        index = 2;
        break;
    }
    return index;
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
