const assert = require('node:assert/strict');
const test = require('node:test');

const { filterAndSortTodos, isTodoOverdue } = require('../.test-dist/utils/todo-utils.js');

function makeTodo(overrides = {}) {
  return {
    id: 1,
    title: 'Default task',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    ...overrides,
  };
}

test('searches title and description while combining status and priority filters', () => {
  const todos = [
    makeTodo({ id: 1, title: 'Write report', description: 'Acme quarter', priority: 'high' }),
    makeTodo({ id: 2, title: 'Review design', description: 'Quarterly review', status: 'completed', priority: 'high' }),
    makeTodo({ id: 3, title: 'Quarterly budget', priority: 'low' }),
  ];

  const visible = filterAndSortTodos(todos, {
    search: ' QUARTER ',
    status: 'pending',
    priority: 'high',
    dueDate: 'all',
    sort: 'newest',
  });

  assert.deepEqual(visible.map((todo) => todo.id), [1]);
});

test('sorts by due date, breaks ties by newest, and keeps undated tasks last', () => {
  const todos = [
    makeTodo({ id: 1, dueDate: '2026-10-20', createdAt: '2026-10-01T09:00:00.000Z' }),
    makeTodo({ id: 2, dueDate: '2026-10-10', createdAt: '2026-10-01T09:00:00.000Z' }),
    makeTodo({ id: 3, dueDate: '2026-10-10', createdAt: '2026-10-02T09:00:00.000Z' }),
    makeTodo({ id: 4, dueDate: null }),
  ];

  const sorted = filterAndSortTodos(todos, {
    search: '',
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    sort: 'dueDate',
  });

  assert.deepEqual(sorted.map((todo) => todo.id), [3, 2, 1, 4]);
});

test('sorts tasks by descending priority and then newest', () => {
  const todos = [
    makeTodo({ id: 1, priority: 'low' }),
    makeTodo({ id: 2, priority: 'high', createdAt: '2026-10-02T09:00:00.000Z' }),
    makeTodo({ id: 3, priority: 'medium' }),
    makeTodo({ id: 4, priority: 'high', createdAt: '2026-10-01T09:00:00.000Z' }),
  ];

  const sorted = filterAndSortTodos(todos, {
    search: '',
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    sort: 'priority',
  });

  assert.deepEqual(sorted.map((todo) => todo.id), [2, 4, 3, 1]);
});

test('sorts newest tasks first by default', () => {
  const todos = [
    makeTodo({ id: 1, createdAt: '2026-10-01T09:00:00.000Z' }),
    makeTodo({ id: 2, createdAt: '2026-10-03T09:00:00.000Z' }),
  ];

  const sorted = filterAndSortTodos(todos, {
    search: '',
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    sort: 'newest',
  });

  assert.deepEqual(sorted.map((todo) => todo.id), [2, 1]);
});

test('flags only past-due pending tasks as overdue', () => {
  const today = '2026-10-20';

  assert.equal(isTodoOverdue(makeTodo({ dueDate: '2026-10-19' }), today), true);
  assert.equal(isTodoOverdue(makeTodo({ dueDate: today }), today), false);
  assert.equal(isTodoOverdue(makeTodo({ dueDate: null }), today), false);
  assert.equal(
    isTodoOverdue(makeTodo({ dueDate: '2026-10-19', status: 'completed' }), today),
    false,
  );
});

test('filters tasks due today and within the next seven days', () => {
  const todos = [
    makeTodo({ id: 1, dueDate: '2026-10-19' }),
    makeTodo({ id: 2, dueDate: '2026-10-20' }),
    makeTodo({ id: 3, dueDate: '2026-10-21' }),
    makeTodo({ id: 4, dueDate: '2026-10-27' }),
    makeTodo({ id: 5, dueDate: '2026-10-28' }),
    makeTodo({ id: 6, dueDate: null }),
  ];
  const getIds = (dueDate) =>
    filterAndSortTodos(todos, {
      search: '',
      status: 'all',
      priority: 'all',
      dueDate,
      sort: 'newest',
      todayKey: '2026-10-20',
    }).map((todo) => todo.id);

  assert.deepEqual(getIds('today'), [2]);
  assert.deepEqual(getIds('next7Days'), [3, 4]);
  assert.deepEqual(getIds('noDate'), [6]);
});

test('overdue date filter excludes completed and undated tasks', () => {
  const todos = [
    makeTodo({ id: 1, dueDate: '2026-10-19' }),
    makeTodo({ id: 2, dueDate: '2026-10-19', status: 'completed' }),
    makeTodo({ id: 3, dueDate: null }),
  ];

  const overdue = filterAndSortTodos(todos, {
    search: '',
    status: 'all',
    priority: 'all',
    dueDate: 'overdue',
    sort: 'newest',
    todayKey: '2026-10-20',
  });

  assert.deepEqual(overdue.map((todo) => todo.id), [1]);
});
