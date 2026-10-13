import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { CreateTodoRequest, Todo, TodoPriority, TodoStatus } from '../../../core/models/todo.model';

function notBlankValidator(control: AbstractControl<string>): ValidationErrors | null {
  const value = control.value;
  return value.length > 0 && value.trim().length === 0 ? { blank: true } : null;
}

// Validators.minLength counts surrounding spaces, but the title is saved trimmed.
function trimmedMinLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl<string>) => {
    const length = control.value.trim().length;
    return length > 0 && length < minLength ? { minlength: true } : null;
  };
}

@Component({
  selector: 'app-todo-form-sidebar',
  templateUrl: './todo-form-sidebar.component.html',
  styleUrls: ['./todo-form-sidebar.component.scss'],
})
export class TodoFormSidebarComponent implements OnChanges {
  /** The todo being edited, or `null` when creating a new one. */
  @Input() todo: Todo | null = null;
  @Input() isOpen = false;
  @Input() isSaving = false;

  @Output() save = new EventEmitter<CreateTodoRequest>();
  @Output() closed = new EventEmitter<void>();

  readonly priorities: TodoPriority[] = ['low', 'medium', 'high'];
  readonly statuses: TodoStatus[] = ['pending', 'completed'];

  readonly todoForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlankValidator, trimmedMinLengthValidator(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    priority: new FormControl<TodoPriority>('medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<TodoStatus>('pending', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dueDate: new FormControl('', { nonNullable: true }),
  });

  get isEditMode(): boolean {
    return this.todo !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
  }

  isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }

    const { title, description, priority, status, dueDate } = this.todoForm.getRawValue();
    this.save.emit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || null,
    });
  }

  private resetForm(): void {
    this.todoForm.reset({
      title: this.todo?.title ?? '',
      description: this.todo?.description ?? '',
      priority: this.todo?.priority ?? 'medium',
      status: this.todo?.status ?? 'pending',
      dueDate: this.todo?.dueDate ?? '',
    });
  }
}
