import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [books, members, categories, borrowings, overdue] = await Promise.all([
          api.books.getAll(),
          api.members.getAll(),
          api.categories.getAll(),
          api.borrowings.getAll(),
          api.borrowings.getOverdue(),
        ]);
        setStats({
          books: books.length,
          members: members.length,
          categories: categories.length,
          borrowings: borrowings.length,
          overdue: overdue.length,
        });
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="alert alert-danger">
        <strong>Error loading dashboard:</strong> {error}
        <p className="mb-0 mt-2 text-muted small">Make sure the backend server is running on port 3000.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h4>Dashboard</h4>
        <p className="text-muted mb-0">Overview of the library system</p>
      </div>
      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value">{stats.books}</div>
            <div className="stat-label">Total Books</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value">{stats.members}</div>
            <div className="stat-label">Members</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value">{stats.categories}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-value">{stats.borrowings}</div>
            <div className="stat-label">Borrowings</div>
          </div>
        </div>
      </div>
      {stats.overdue > 0 && (
        <div className="alert alert-warning mt-4 mb-0">
          <strong>{stats.overdue}</strong> borrowing{stats.overdue > 1 ? 's are' : ' is'} overdue.
        </div>
      )}
    </div>
  );
}
