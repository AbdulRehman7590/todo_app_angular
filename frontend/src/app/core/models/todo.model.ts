export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoStatus = 'pending' | 'completed';

export interface Todo {
  id: number;
  title: string;
  description: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate: string | null;
  createdAt: string;
}

/** Fields the user fills in; `id` and `createdAt` are generated on save. */
export type CreateTodoRequest = Omit<Todo, 'id' | 'createdAt'>;

export type TodoViewMode = 'list' | 'card';
