import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Todo } from '../../../core/models/todo.model';

@Component({
  selector: 'app-todo-details-sidebar',
  templateUrl: './todo-details-sidebar.component.html',
  styleUrls: ['./todo-details-sidebar.component.scss'],
})
export class TodoDetailsSidebarComponent {
  @Input() todo: Todo | null = null;
  @Input() isOpen = false;

  @Output() edit = new EventEmitter<Todo>();
  @Output() remove = new EventEmitter<Todo>();
  @Output() toggleStatus = new EventEmitter<Todo>();
  @Output() closed = new EventEmitter<void>();
}
