import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Todo, TodoViewMode } from '../../../core/models/todo.model';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss'],
})
export class TodoCardComponent {
  @Input({ required: true }) todo!: Todo;
  @Input() layout: TodoViewMode = 'card';

  @Output() view = new EventEmitter<Todo>();
  @Output() edit = new EventEmitter<Todo>();
  @Output() remove = new EventEmitter<Todo>();
  @Output() toggleStatus = new EventEmitter<Todo>();
}
