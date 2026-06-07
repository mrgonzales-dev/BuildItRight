import { useAuth } from '../App';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <div className="avatar">{initial}</div>
        <h4>{user?.name}</h4>
        <p className="email">{user?.email}</p>
        {joined && <p className="joined">Joined {joined}</p>}
        <button className="btn btn-outline-danger" onClick={logout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
