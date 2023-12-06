import {Directive, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[appTextareaResize]',
  standalone: true
})
export class TextareaResizeDirective implements OnInit {

  private textAreaRef?: HTMLTextAreaElement;
  private currentHeight?: number;
  private currentRowsNumber?: number;
  private heightPerRow?: number;
  private maxRowsNumber = 3;
  private initted = false;
  constructor(
    private elementRef: ElementRef,
    private renderer2: Renderer2
  ) { }

  @HostListener('input', ['$event'])
  checkTextAreaSize(ev: InputEvent) {
    if (!this.initted) { this.init(); }
    if (!this.textAreaRef || !this.currentHeight  || !this.currentRowsNumber || !this.heightPerRow) { return; }
    const neededRows = Math.ceil(this.textAreaRef.scrollHeight / this.heightPerRow);
    const newHeight = neededRows >= this.maxRowsNumber ? this.heightPerRow * this.maxRowsNumber :
      this.heightPerRow * neededRows;

    if (neededRows > this.maxRowsNumber) { this.enableOverflowY(); }
    else { this.disableOverflowY(); }

    if (neededRows > this.currentRowsNumber) { this.currentRowsNumber = neededRows < this.maxRowsNumber ? neededRows : this.maxRowsNumber; }
    else if (neededRows < this.currentRowsNumber) { this.currentRowsNumber = neededRows >= 1 ? neededRows : 1; }

    this.renderer2.setStyle(this.textAreaRef, 'height', `${newHeight}px`);
    this.currentHeight = newHeight;
  }

  ngOnInit(): void {
    this.textAreaRef = this.elementRef.nativeElement;
    if (!this.textAreaRef) { return; }
    this.currentRowsNumber = 1;
    if (this.textAreaRef.clientHeight) {
      this.heightPerRow = this.textAreaRef!.clientHeight;
      this.currentHeight = this.textAreaRef!.scrollHeight;
      this.initted = true;
    }
    this.disableOverflowY();
  }

  private disableOverflowY() {
    if (!this.textAreaRef) { return; }
    this.renderer2.setStyle(this.textAreaRef, 'overflow-y', 'hidden');
  }

  private enableOverflowY() {
    if (!this.textAreaRef) { return; }
    this.renderer2.setStyle(this.textAreaRef, 'overflow-y', 'scroll');
  }

  private init() {
    this.heightPerRow = this.textAreaRef!.clientHeight;
    this.currentHeight = this.textAreaRef!.scrollHeight;
    this.initted = true;
  }

}
