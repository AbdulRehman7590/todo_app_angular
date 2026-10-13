import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

let nextId = 0;

/**
 * Reusable right-side panel. Callers project their own content into it:
 * the default slot becomes the body, and `[sidebar-footer]` becomes the footer.
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnChanges {
  @Input({ required: true }) heading = '';
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  readonly headingId = `sidebar-heading-${nextId++}`;
  private previouslyFocused: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    const openChange = changes['isOpen'];
    if (!openChange || openChange.firstChange) {
      return;
    }

    if (this.isOpen) {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      // Wait until the panel has rendered as visible; hidden elements cannot take focus.
      setTimeout(() => this.panel?.nativeElement.focus());
    } else {
      this.previouslyFocused?.focus();
      this.previouslyFocused = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closed.emit();
    }
  }

  // Keeps Tab / Shift+Tab cycling inside the open panel instead of reaching the page behind it.
  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  trapFocus(event: KeyboardEvent): void {
    const panel = this.panel?.nativeElement;
    if (!this.isOpen || !panel) {
      return;
    }

    const focusable = panel.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }
}
