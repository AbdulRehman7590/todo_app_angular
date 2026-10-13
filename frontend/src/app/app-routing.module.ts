import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TodoPageComponent } from './features/todos/todo-page/todo-page.component';

const routes: Routes = [
  { path: '', component: TodoPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
