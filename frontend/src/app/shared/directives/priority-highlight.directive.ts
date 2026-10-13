import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

import { TodoPriority } from '../../core/models/todo.model';

@Directive({
  selector: '[appPriorityHighlight]',
})
export class PriorityHighlightDirective implements OnChanges {
  @Input() appPriorityHighlight: TodoPriority = 'low';

  constructor(
    private element: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    const host = this.element.nativeElement;

    if (this.appPriorityHighlight === 'high') {
      this.renderer.setStyle(host, 'border-left', '4px solid var(--color-danger)');
    } else {
      this.renderer.removeStyle(host, 'border-left');
    }
  }
}
