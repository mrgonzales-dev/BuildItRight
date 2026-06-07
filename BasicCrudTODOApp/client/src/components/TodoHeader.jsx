import { PlusIcon } from './Icons';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Done' },
];

export default function TodoHeader({ stats, filter, onFilterChange, onCreate }) {
  return (
    <header className="card-header">
      <div className="card-header-top">
        <div>
          <h1 className="card-title">Tasks</h1>
          <p className="card-subtitle">
            {stats.pending === 0 && stats.total > 0
              ? 'All caught up'
              : `${stats.pending} remaining`}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={onCreate}>
          <PlusIcon />
          <span>Add</span>
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-pill">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-pill">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-pill">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-tab${filter === f.id ? ' active' : ''}`}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </header>
  );
}
