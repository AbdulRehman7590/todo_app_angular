# Todo Manager

A lightweight task manager for creating, prioritizing, and tracking personal work. The app uses Angular 16, TypeScript, RxJS, SCSS, and JSON Server, with Docker Compose for local development.

## Features

- Create, edit, complete, and delete tasks with title, description, priority, status, and an optional due date.
- Find tasks by title or description, filter by status, priority, or due date, and sort by newest, due date, or priority.
- Open quick views for tasks due today, due in the next seven days, overdue, or missing a due date.
- See overdue due dates at a glance, plus task totals and completion progress.
- Switch between compact list and card layouts.
- Use responsive screens, validated forms, accessible side panels, loading states, error recovery, and save notifications.

## Quick start

Install and start Docker Desktop, then run from the project root:

~~~powershell
docker compose up --build
~~~

Open the app at http://localhost:4200. The JSON Server API is available at http://localhost:3000/todos.

Use start.bat and stop.bat on Windows, or run docker compose down to stop the services. Task data is stored in backend/db.json and remains on disk when containers stop.

## Development

The frontend container runs the Angular development server with live reload. Source files are mounted from frontend, and its node_modules directory is provided by a Docker volume so Linux dependencies stay separate from the host.

Build the frontend inside the running container:

~~~powershell
docker compose exec frontend npm run build
~~~

Run the focused unit tests for search, filtering, sorting, and due-date views:

~~~powershell
docker compose exec frontend npm test
~~~

The Angular dev server forwards browser requests from /api to JSON Server. The browser therefore uses the same origin for the UI and API, while JSON Server reads and writes backend/db.json.

## Task behavior

Task titles are required, trimmed, and limited to 3 to 100 characters. Descriptions are optional and limited to 500 characters. Due dates are optional and stored as YYYY-MM-DD. Priorities are low, medium, or high; statuses are pending or completed.

The list can be sorted by newest task first, earliest due date first (undated tasks last), or priority (high to low). Overdue labels apply to pending tasks whose due date is earlier than the user's local calendar date.

## Project layout

- backend/db.json — sample tasks and JSON Server storage
- backend/Dockerfile — JSON Server container
- frontend/src/app/core — task model and HTTP service
- frontend/src/app/features/todos — dashboard, task list, task cards, form and details panels
- frontend/src/app/shared — reusable sidebar, priority directive, and label pipe
- frontend/proxy.conf.json — local API proxy
- docker-compose.yml — frontend and backend services

## API

The frontend calls these relative endpoints through the Angular proxy:

| Operation | Request | Purpose |
| --- | --- | --- |
| List tasks | GET /api/todos | Fetch tasks, newest first |
| Read task | GET /api/todos/:id | Refresh a task's details |
| Create task | POST /api/todos | Create a task with a generated ID and timestamp |
| Update task | PATCH /api/todos/:id | Update task fields |
| Delete task | DELETE /api/todos/:id | Remove a task |

## Scope

JSON Server is a simple local development backend. Replace it with a production API and database before using the app for shared or business-critical task data.
