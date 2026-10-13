import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import {
  CreateTodoRequest,
  Todo,
  TodoPriority,
  TodoStatus,
  TodoViewMode,
} from '../../../core/models/todo.model';
import { TodoService } from '../../../core/services/todo.service';

type StatusFilter = 'all' | TodoStatus;
type PriorityFilter = 'all' | TodoPriority;
type ViewState = 'loading' | 'error' | 'empty' | 'no-results' | 'ready';

interface Notice {
  type: 'success' | 'error';
  text: string;
}

@Component({
  selector: 'app-todo-page',
  templateUrl: './todo-page.component.html',
  styleUrls: ['./todo-page.component.scss'],
})
export class TodoPageComponent {
  todos: Todo[] = [];
  visibleTodos: Todo[] = [];
  statCards: {
    label: string;
    value: number;
    caption: string;
    color: string;
  }[] = [];
  completionPercent = 0;

  isLoading = true;
  loadError = '';
  notice: Notice | null = null;

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly priorityControl = new FormControl<PriorityFilter>('all', {
    nonNullable: true,
  });
  readonly statusFilters: StatusFilter[] = ['all', 'pending', 'completed'];
  statusFilter: StatusFilter = 'all';
  private searchTerm = '';
  viewMode: TodoViewMode = 'list';

  activeSidebar: 'form' | 'details' | null = null;
  editingTodo: Todo | null = null;
  isSaving = false;

  /** Emitting on this subject reloads the todo list. */
  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly todoSelection$ = new Subject<Todo>();
  readonly selectedTodo$: Observable<Todo>;

  private noticeTimer?: ReturnType<typeof setTimeout>;

  constructor(private todoService: TodoService) {
    // takeUntilDestroyed() must be called in an injection context (here, the constructor).
    // It unsubscribes automatically when this component is destroyed.
    this.refresh$
      .pipe(
        tap(() => {
          this.isLoading = true;
          this.loadError = '';
        }),
        // switchMap drops a still-pending request if a newer refresh starts.
        switchMap(() =>
          this.todoService.getTodos().pipe(
            // Handled inside switchMap so one failed request doesn't end the refresh stream.
            catchError(() => {
              this.loadError =
                'Could not load todos. Please check that the API is running.';
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((todos) => {
        this.todos = todos;
        this.isLoading = false;
        this.updateStats();
        this.applyFilters();
      });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((value) => value.trim().toLowerCase()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.applyFilters();
      });

    this.priorityControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.applyFilters());

    // Shows the selected todo immediately, then swaps in the latest copy from the server.
    // Subscribed in the template via the async pipe.
    this.selectedTodo$ = this.todoSelection$.pipe(
      switchMap((todo) =>
        this.todoService.getTodoById(todo.id).pipe(
          startWith(todo),
          catchError(() => {
            this.showNotice('error', 'Could not refresh todo details.');
            return EMPTY;
          }),
        ),
      ),
    );
  }

  get viewState(): ViewState {
    if (this.loadError) return 'error';
    if (this.isLoading && this.todos.length === 0) return 'loading';
    if (this.todos.length === 0) return 'empty';
    if (this.visibleTodos.length === 0) return 'no-results';
    return 'ready';
  }

  loadTodos(): void {
    this.refresh$.next();
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.priorityControl.setValue('all');
    this.setStatusFilter('all');
  }

  openCreateForm(): void {
    this.editingTodo = null;
    this.activeSidebar = 'form';
  }

  openEditForm(todo: Todo): void {
    this.editingTodo = todo;
    this.activeSidebar = 'form';
  }

  openDetails(todo: Todo): void {
    this.todoSelection$.next(todo);
    this.activeSidebar = 'details';
  }

  closeSidebar(): void {
    this.activeSidebar = null;
  }

  saveTodo(data: CreateTodoRequest): void {
    const editingTodo = this.editingTodo;
    const request$ = editingTodo
      ? this.todoService.updateTodo(editingTodo.id, data)
      : this.todoService.createTodo(data);

    this.isSaving = true;
    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeSidebar();
        this.showNotice(
          'success',
          editingTodo ? 'Todo updated.' : 'Todo created.',
        );
        this.loadTodos();
      },
      error: () => {
        this.isSaving = false;
        this.showNotice('error', 'Could not save the todo. Please try again.');
      },
    });
  }

  toggleStatus(todo: Todo): void {
    const status: TodoStatus =
      todo.status === 'completed' ? 'pending' : 'completed';

    this.todoService.updateTodo(todo.id, { status }).subscribe({
      next: (updatedTodo) => {
        this.showNotice(
          'success',
          status === 'completed'
            ? 'Todo marked as complete.'
            : 'Todo marked as pending.',
        );
        this.loadTodos();
        if (this.activeSidebar === 'details') {
          this.todoSelection$.next(updatedTodo);
        }
      },
      error: () =>
        this.showNotice('error', 'Could not update the todo status.'),
    });
  }

  deleteTodo(todo: Todo): void {
    if (!window.confirm(`Delete "${todo.title}"? This cannot be undone.`)) {
      return;
    }

    this.todoService.deleteTodo(todo.id).subscribe({
      next: () => {
        this.closeSidebar();
        this.showNotice('success', 'Todo deleted.');
        this.loadTodos();
      },
      error: () => this.showNotice('error', 'Could not delete the todo.'),
    });
  }

  private applyFilters(): void {
    const priority = this.priorityControl.value;

    this.visibleTodos = this.todos.filter((todo) => {
      const matchesStatus =
        this.statusFilter === 'all' || todo.status === this.statusFilter;
      const matchesPriority = priority === 'all' || todo.priority === priority;
      const matchesSearch =
        !this.searchTerm ||
        todo.title.toLowerCase().includes(this.searchTerm) ||
        todo.description.toLowerCase().includes(this.searchTerm);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }

  private updateStats(): void {
    const total = this.todos.length;
    const completed = this.todos.filter(
      (todo) => todo.status === 'completed',
    ).length;
    const highPriority = this.todos.filter(
      (todo) => todo.priority === 'high',
    ).length;

    this.completionPercent = total ? Math.round((completed / total) * 100) : 0;
    this.statCards = [
      {
        label: 'Total todos',
        value: total,
        caption: 'All tasks',
        color: 'var(--color-primary)',
      },
      {
        label: 'Completed',
        value: completed,
        caption: `${this.completionPercent}% done`,
        color: 'var(--color-success)',
      },
      {
        label: 'Pending',
        value: total - completed,
        caption: 'Still to do',
        color: 'var(--color-warning)',
      },
      {
        label: 'High priority',
        value: highPriority,
        caption: 'Need attention',
        color: 'var(--color-danger)',
      },
    ];
  }

  private showNotice(type: Notice['type'], text: string): void {
    this.notice = { type, text };
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => (this.notice = null), 3000);
  }
}
