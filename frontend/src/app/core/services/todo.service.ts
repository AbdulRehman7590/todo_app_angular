import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateTodoRequest, Todo } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly apiUrl = '/api/todos';

  constructor(private http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    // JSON Server query params: newest todos first.
    return this.http.get<Todo[]>(this.apiUrl, {
      params: { _sort: 'createdAt', _order: 'desc' },
    });
  }

  getTodoById(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`);
  }

  createTodo(data: CreateTodoRequest): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, {
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  updateTodo(id: number, data: Partial<Todo>): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, data);
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
