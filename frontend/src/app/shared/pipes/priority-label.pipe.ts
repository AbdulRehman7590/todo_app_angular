import { Pipe, PipeTransform } from '@angular/core';

import { TodoPriority } from '../../core/models/todo.model';

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
};

@Pipe({
  name: 'priorityLabel',
})
export class PriorityLabelPipe implements PipeTransform {
  transform(priority: TodoPriority): string {
    return PRIORITY_LABELS[priority];
  }
}
