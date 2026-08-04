import { useState } from 'react';
import TodoForm from './TodoForm';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function parseDate(dueDate) {
  const [y, m, d] = dueDate.split('-').map(Number);
  return { day: d, month: MONTHS[m - 1] };
}

export default function TodoList({ todos, onToggle, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  if (todos.length === 0) {
    return <div className="empty-state">Nothing on the To-do list yet. Add your first to-do above.</div>;
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => {
        if (editingId === todo.id) {
          return (
            <TodoForm
              key={todo.id}
              initial={todo}
              onSubmit={(values) => {
                onUpdate(todo.id, values);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        const { day, month } = parseDate(todo.dueDate);

        return (
          <div key={todo.id} className={`todo-card${todo.completed ? ' completed' : ''}`}>
            <div className="todo-date-tab">
              <span className="todo-date-day">{day}</span>
              <span className="todo-date-month">{month}</span>
            </div>
            <div className="todo-body">
              <span className={`todo-title${todo.completed ? ' done' : ''}`}>{todo.title}</span>
              {todo.description && <span className="todo-desc">{todo.description}</span>}
            </div>
            <div className="todo-actions">
              <button
                type="button"
                className="icon-btn"
                onClick={() => onToggle(todo)}
                aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
                title={todo.completed ? 'Mark as not done' : 'Mark as done'}
              >
                {todo.completed ? '↺ Undo' : '✓ Done'}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditingId(todo.id)}
                aria-label="Edit"
              >
                Edit
              </button>
              <button type="button" className="btn-danger" onClick={() => onDelete(todo.id)}>
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
