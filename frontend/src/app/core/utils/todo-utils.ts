import type {
  Todo,
  TodoPriority,
  TodoStatus,
} from '../models/todo.model';

export type TodoSortOption = 'newest' | 'dueDate' | 'priority';
export type TodoDateFilter = 'all' | 'today' | 'next7Days' | 'overdue' | 'noDate';

export interface TodoFilters {
  search: string;
  status: 'all' | TodoStatus;
  priority: 'all' | TodoPriority;
  dueDate: TodoDateFilter;
  sort: TodoSortOption;
  todayKey?: string;
}

const PRIORITY_RANK: Record<TodoPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function filterAndSortTodos(
  todos: readonly Todo[],
  filters: TodoFilters,
): Todo[] {
  const search = filters.search.trim().toLowerCase();
  const todayKey = filters.todayKey ?? getLocalDateKey();
  const nextWeekKey =
    filters.dueDate === 'next7Days' ? addDaysToDateKey(todayKey, 7) : '';
  const matches = todos.filter((todo) => {
    const matchesStatus = filters.status === 'all' || todo.status === filters.status;
    const matchesPriority =
      filters.priority === 'all' || todo.priority === filters.priority;
    const matchesSearch =
      !search ||
      todo.title.toLowerCase().includes(search) ||
      todo.description.toLowerCase().includes(search);

    return (
      matchesStatus &&
      matchesPriority &&
      matchesDueDateFilter(todo, filters.dueDate, todayKey, nextWeekKey) &&
      matchesSearch
    );
  });

  return matches.sort((left, right) => {
    const newestFirst = right.createdAt.localeCompare(left.createdAt);

    switch (filters.sort) {
      case 'dueDate':
        if (!left.dueDate) return right.dueDate ? 1 : newestFirst;
        if (!right.dueDate) return -1;
        return left.dueDate.localeCompare(right.dueDate) || newestFirst;
      case 'priority':
        return (
          PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] ||
          newestFirst
        );
      case 'newest':
        return newestFirst;
    }
  });
}

export function isTodoOverdue(
  todo: Pick<Todo, 'dueDate' | 'status'>,
  todayKey = getLocalDateKey(),
): boolean {
  return (
    todo.status === 'pending' &&
    todo.dueDate !== null &&
    todo.dueDate < todayKey
  );
}

function matchesDueDateFilter(
  todo: Todo,
  filter: TodoDateFilter,
  todayKey: string,
  nextWeekKey: string,
): boolean {
  switch (filter) {
    case 'today':
      return todo.dueDate === todayKey;
    case 'next7Days':
      return (
        todo.dueDate !== null &&
        todo.dueDate > todayKey &&
        todo.dueDate <= nextWeekKey
      );
    case 'overdue':
      return isTodoOverdue(todo, todayKey);
    case 'noDate':
      return todo.dueDate === null;
    case 'all':
      return true;
  }
}

function getLocalDateKey(): string {
  return formatLocalDateKey(new Date());
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return formatLocalDateKey(new Date(year, month - 1, day + days));
}

function formatLocalDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
