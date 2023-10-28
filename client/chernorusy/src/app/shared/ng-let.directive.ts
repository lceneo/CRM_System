import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[ngLet]',
  standalone: true
})
export class NgLetDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private vcRef: ViewContainerRef,
  ) { }

  private hasNgLet = false;
  private rerender = false;

  @Input()
  set ngLet(context: unknown) {
    this.context.$implicit = this.context.ngLet = context;
    if (!this.hasNgLet || this.rerender) {
      this.vcRef.clear();
      this.vcRef.createEmbeddedView(this.templateRef, this.context);
      this.hasNgLet = true;
    }
  }

  @Input()
  set ngLetRerender(rerender: boolean) {
    this.rerender = !!rerender;
  }

  private context: {
    $implicit: unknown;
    ngLet: unknown;
  } = {
    $implicit: null,
    ngLet: null,
  };

}
