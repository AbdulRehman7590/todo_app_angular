import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TodoCardComponent } from './features/todos/todo-card/todo-card.component';
import { TodoDetailsSidebarComponent } from './features/todos/todo-details-sidebar/todo-details-sidebar.component';
import { TodoFormSidebarComponent } from './features/todos/todo-form-sidebar/todo-form-sidebar.component';
import { TodoListComponent } from './features/todos/todo-list/todo-list.component';
import { TodoPageComponent } from './features/todos/todo-page/todo-page.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { PriorityHighlightDirective } from './shared/directives/priority-highlight.directive';
import { PriorityLabelPipe } from './shared/pipes/priority-label.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TodoPageComponent,
    TodoListComponent,
    TodoCardComponent,
    TodoFormSidebarComponent,
    TodoDetailsSidebarComponent,
    SidebarComponent,
    PriorityHighlightDirective,
    PriorityLabelPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
