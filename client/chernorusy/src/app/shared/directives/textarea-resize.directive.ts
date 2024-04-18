import {Directive, ElementRef, HostListener, Input, OnInit, Renderer2, RendererStyleFlags2} from '@angular/core';

@Directive({
  selector: '[appTextareaResize]',
  standalone: true
})
export class TextareaResizeDirective implements OnInit {

  private textAreaRef?: HTMLTextAreaElement;
  constructor(
    private elementRef: ElementRef,
    private renderer2: Renderer2
  ) { }

  @HostListener('input', ['$event'])
  checkTextAreaSize(ev: InputEvent) {
    this.renderer2.setStyle(this.textAreaRef, 'height', `45px`);
    this.renderer2.setStyle(this.textAreaRef, 'height', `${this.textAreaRef?.scrollHeight}px`);
  }

  ngOnInit(): void {
    if (!this.textAreaRef) { this.initTextAreaRef(); }
    this.renderer2.setStyle(this.textAreaRef, 'box-sizing', `content-box`);
  }

  private initTextAreaRef() {
    this.textAreaRef = this.elementRef.nativeElement;
    if (!this.textAreaRef) { return; }
  }

}
