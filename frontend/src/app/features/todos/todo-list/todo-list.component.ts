import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Todo, TodoViewMode } from '../../../core/models/todo.model';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent {
  @Input({ required: true }) todos: Todo[] = [];
  @Input() viewMode: TodoViewMode = 'list';

  @Output() view = new EventEmitter<Todo>();
  @Output() edit = new EventEmitter<Todo>();
  @Output() remove = new EventEmitter<Todo>();
  @Output() toggleStatus = new EventEmitter<Todo>();

  // Lets *ngFor reuse DOM elements for todos that are still in the list after a refresh.
  trackById(_index: number, todo: Todo): number {
    return todo.id;
  }
}
