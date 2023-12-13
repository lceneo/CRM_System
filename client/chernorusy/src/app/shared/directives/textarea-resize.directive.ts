import {Directive, ElementRef, HostListener, OnInit, Renderer2, RendererStyleFlags2} from '@angular/core';

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
    console.log(this.textAreaRef?.scrollHeight)
  }

  ngOnInit(): void {
    this.textAreaRef = this.elementRef.nativeElement;
    if (!this.textAreaRef) { return; }
    this.renderer2.setStyle(this.textAreaRef, 'box-sizing', `content-box`, RendererStyleFlags2.Important);
  }
}
