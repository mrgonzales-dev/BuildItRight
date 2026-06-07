import { PencilIcon, TrashIcon, CheckIcon } from './Icons';

export default function TodoList({
  loading,
  filter,
  items,
  togglingId,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <ul className="todo-list" aria-label="Loading tasks">
        {[1, 2, 3].map((i) => (
          <li key={i} className="todo-skeleton" aria-hidden="true" />
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">
          {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
        </p>
        <p className="empty-hint">
          {filter === 'all' ? 'Tap Add to create your first task.' : 'Try a different filter.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {items.map((todo, index) => (
        <li
          key={todo.id}
          className={`todo-row${todo.completed ? ' completed' : ''}`}
          style={{ '--stagger': `${index * 40}ms` }}          // Staggered entrance animation via CSS custom property
        >
          <button
            type="button"
            className={`todo-check${todo.completed ? ' checked' : ''}`}
            onClick={() => onToggleComplete(todo)}
            disabled={togglingId === todo.id}
            aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {todo.completed && <CheckIcon />}
          </button>

          <div className="todo-text">
            <span className="todo-title">{todo.title}</span>
            {todo.description && (
              <span className="todo-desc">{todo.description}</span>
            )}
          </div>

          <div className="todo-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => onEdit(todo)}
              aria-label="Edit task"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete task"
            >
              <TrashIcon />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
