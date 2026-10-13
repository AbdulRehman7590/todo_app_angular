# Learning Map

Each Angular concept used in this project and where to find it. Paths are relative to `frontend/src/app/`.

A suggested reading order is at the bottom.

## Architecture

| Angular Concept | File | Purpose |
| --- | --- | --- |
| `@NgModule` | `app.module.ts` | Declares all components, the directive and the pipe; imports `HttpClientModule` and `ReactiveFormsModule` |
| Routing module | `app-routing.module.ts` | Maps `''` to `TodoPageComponent`; unknown URLs redirect home |
| `<router-outlet>` | `app.component.html` | Where the routed page renders |
| `@Component` | every `*.component.ts` | Template + styles + class |
| `@Injectable({ providedIn: 'root' })` | `core/services/todo.service.ts` | One shared service instance for the whole app |
| Constructor injection | `todo.service.ts`, `todo-page.component.ts`, `priority-highlight.directive.ts` | `HttpClient`, `TodoService`, `ElementRef`/`Renderer2` are injected through the constructor |
| TypeScript models | `core/models/todo.model.ts` | `Todo`, union types for priority/status/view mode, `CreateTodoRequest = Omit<Todo, 'id' \| 'createdAt'>` |

## Component communication

| Angular Concept | File | Purpose |
| --- | --- | --- |
| `@Input()` | `todo-card.component.ts` | Receive one todo from the list |
| `@Input({ required: true })` | `todo-card.component.ts`, `todo-list.component.ts`, `sidebar.component.ts` | Angular 16 feature: compile error if the parent forgets the input |
| `@Input()` with a default | `todo-list.component.ts` (`viewMode`), `todo-card.component.ts` (`layout`) | Page passes the list/card choice down two levels |
| `@Output()` + `EventEmitter` | `todo-card.component.ts` | Notify parent of view/edit/remove/toggleStatus |
| Re-emitting events | `todo-list.component.html` | List forwards card events up to the page |
| Container component | `todo-page.component.ts` | Owns state, calls the service, handles every child event |
| `ngOnChanges` | `todo-form-sidebar.component.ts` | Reset/populate the form whenever the sidebar opens |
| `ngOnChanges` + `SimpleChanges` | `sidebar.component.ts` | React to `isOpen` changing to move focus |
| Content projection `<ng-content>` | `shared/components/sidebar/sidebar.component.html` | Default slot for the body, `select="[sidebar-footer]"` slot for actions |
| `@ViewChild` | `sidebar.component.ts` | Get the panel element to focus it |
| `@HostListener` | `sidebar.component.ts` | Close on `document:keydown.escape`; trap focus on `keydown.tab` / `keydown.shift.tab` |

## Directives

| Angular Concept | File | Purpose |
| --- | --- | --- |
| `*ngFor` + `trackBy` | `todo-list.component.html` / `.ts` | Render cards; reuse DOM for unchanged todos |
| `*ngFor` | `todo-page.component.html` | Stat cards and status filter buttons |
| `*ngIf` | `todo-card.component.html`, `todo-form-sidebar.component.html` | Optional description/due date, validation messages |
| `*ngIf` guarding nullable input | `todo-details-sidebar.component.html` | Render details only once a todo is selected |
| `[ngSwitch]` / `*ngSwitchCase` / `*ngSwitchDefault` | `todo-page.component.html` | Show loading, error, empty, no-results or the list |
| `[ngClass]` | `todo-card.component.html`, `todo-list.component.html`, `todo-page.component.html` | Badge colours, completed style, row vs card layout, active filter/view button |
| Event binding with a template statement | `todo-page.component.html` | `(click)="viewMode = 'list'"` switches the layout without a method |
| `[ngStyle]` | `todo-page.component.html` | Dot colour per stat card |
| Style binding `[style.width.%]` | `todo-page.component.html` | Progress bar width from `completionPercent` |
| Attribute binding `[attr.aria-*]` | `todo-card.component.html`, `todo-page.component.html` | Accessible labels/states on the checkbox, toggles and progress bar |
| Custom attribute directive | `shared/directives/priority-highlight.directive.ts` | `[appPriorityHighlight]` adds a red border to high-priority cards via `Renderer2` |

## Pipes

| Angular Concept | File | Purpose |
| --- | --- | --- |
| `DatePipe` | `todo-card.component.html`, `todo-details-sidebar.component.html` | `mediumDate`, `fullDate`, `medium` formats |
| `TitleCasePipe` | `todo-card.component.html`, `todo-page.component.html`, `todo-form-sidebar.component.html` | `pending` → `Pending` |
| `UpperCasePipe` | `todo-details-sidebar.component.html` | Status badge in details |
| `AsyncPipe` | `todo-page.component.html` | Subscribes to `selectedTodo$` and unsubscribes automatically |
| Custom pipe (`@Pipe`, `PipeTransform`) | `shared/pipes/priority-label.pipe.ts` | `high` → `High Priority` |

## Reactive Forms

| Angular Concept | File | Purpose |
| --- | --- | --- |
| `ReactiveFormsModule` | `app.module.ts` | Enables `[formGroup]`, `formControlName`, `[formControl]` |
| Typed `FormGroup` / `FormControl` | `todo-form-sidebar.component.ts` | `nonNullable: true` so values are `string`, never `null` |
| `Validators` | `todo-form-sidebar.component.ts` | `required`, `maxLength(100/500)` |
| Custom validator function | `todo-form-sidebar.component.ts` | `notBlankValidator` rejects whitespace-only titles |
| Validator factory (`ValidatorFn`) | `todo-form-sidebar.component.ts` | `trimmedMinLengthValidator(3)` counts length without surrounding spaces, because the title is saved trimmed |
| `[formGroup]`, `formControlName`, `(ngSubmit)` | `todo-form-sidebar.component.html` | Bind the form in the template |
| `markAllAsTouched()` | `todo-form-sidebar.component.ts` | Show all errors when submitting an invalid form |
| `reset(values)` | `todo-form-sidebar.component.ts` | Same form for create (defaults) and edit (todo values) |
| Standalone `FormControl` | `todo-page.component.ts` | Search box and priority filter |

## RxJS

All in `features/todos/todo-page/todo-page.component.ts` unless noted.

| Angular Concept | Purpose |
| --- | --- |
| `Observable` from `HttpClient` | Every method in `core/services/todo.service.ts` |
| `BehaviorSubject` (`refresh$`) | Emitting reloads the list; starts with one value, so it loads immediately |
| `pipe()` | Composes operators on each stream |
| `tap()` | Set `isLoading` before each request |
| `switchMap()` | List refresh: a newer refresh cancels a pending request. Details: selecting another todo cancels the previous lookup |
| `catchError()` | Show an error message and keep the stream alive (placed inside `switchMap`) |
| `debounceTime(300)` | Wait until the user pauses typing before filtering |
| `map()` | Normalise the search term (trim + lowercase) |
| `distinctUntilChanged()` | Skip filtering when the term didn't actually change |
| `startWith()` | Details sidebar shows the todo we already have while the latest copy loads |
| `takeUntilDestroyed()` | Auto-unsubscribe. Must be called in an injection context, which is why the subscriptions live in the constructor |
| `.subscribe({ next, error })` | Create/update/delete calls. HTTP observables complete on their own, so no cleanup is needed |

## HTTP and Docker

| Concept | File | Purpose |
| --- | --- | --- |
| `HttpClient` (`get`, `post`, `patch`, `delete`) | `core/services/todo.service.ts` | All API communication |
| Query params | `todo.service.ts` | `_sort=createdAt&_order=desc` (JSON Server feature) |
| Dev proxy | `frontend/proxy.conf.json`, `angular.json` (`serve.options.proxyConfig`) | `/api` → JSON Server, no CORS needed |
| Docker Compose | `docker-compose.yml` | Two services, port mappings, bind mounts, named `node_modules` volume |

## Suggested reading order

1. `core/models/todo.model.ts`: the data shape.
2. `core/services/todo.service.ts`: how data is fetched.
3. `app.module.ts`: how the pieces are registered.
4. `features/todos/todo-page/todo-page.component.ts` and `.html`: the state and the RxJS streams.
5. `todo-list` → `todo-card`: `@Input` down, `@Output` up.
6. `shared/components/sidebar/`: content projection and accessibility.
7. `todo-form-sidebar`: Reactive Forms and validation.
8. `shared/directives/` and `shared/pipes/`: custom directive and pipe.
