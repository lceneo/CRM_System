import {
  Directive,
  ElementRef,
  Input,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { Subject, combineLatest, Observable, startWith } from 'rxjs';
import { hexToRGB, isHex, isLightColor } from '../helpers/color';

@Directive({
  selector: '[app-auto-text-color]',
  standalone: true,
})
export class AutoTextColorDirective {
  @Input() mode: 'blackwhite' | 'opposite' = 'blackwhite';
  @Input() lightColor?: string;
  @Input() darkColor?: string;

  private change$ = new Subject<SimpleChanges>();

  ngOnChanges(changes: SimpleChanges) {
    this.change$.next(changes);
  }

  ngAfterViewInit() {
    this.recalculate();
  }

  recalculate() {
    const backgroundColor = this.parseBackgroundColor();
    if (!backgroundColor) {
      return;
    }
    const isLight = isLightColor(backgroundColor);
    let color = 'black';
    if (!isLight) {
      color = 'white';
    }
    this.elem.nativeElement.style.setProperty('color', color);
  }

  parseBackgroundColor() {
    let backgroundColor = this.elem.nativeElement
      .computedStyleMap()
      .get('background-color')
      ?.toString();
    if (!backgroundColor) {
      return null;
    }

    if (isHex(backgroundColor)) {
      backgroundColor = hexToRGB(backgroundColor);
    }
    return backgroundColor;
  }

  constructor(private elem: ElementRef<HTMLElement>) {
    new MutationObserver((records) => {
      records[0].attributeNamespace;
    });
  }
}
