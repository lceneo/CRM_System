import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[ngLet]',
  standalone: true
})
export class NgLetDirective<T> {

  constructor(
    private templateRef: TemplateRef<any>,
    private vcRef: ViewContainerRef,
  ) { }

  private hasNgLet = false;
  private rerender = false;

  @Input()
  set ngLet(context: T) {
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

  private context: NgLetContext<T> = {
    // @ts-expect-error
    $implicit: null,
    // @ts-expect-error
    ngLet: null,
  };
  static ngTemplateContextGuard<T>(dir: NgLetDirective<T>, ctx: unknown): ctx is NgLetContext<T> { return true; };
}

class NgLetContext<T = unknown> {
  // @ts-expect-error
  $implicit: T = null;
  // @ts-expect-error
  ngLet: T = null;
}
