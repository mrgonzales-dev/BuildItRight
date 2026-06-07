import { useState } from 'react';
import { Routes, Route, NavLink, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Elections from './pages/Elections';
import BallotSetup from './pages/BallotSetup';
import Voters from './pages/Voters';
import AuditLog from './pages/AuditLog';
import Results from './pages/Results';
import VoteAccess from './pages/VoteAccess';
import VoteBallot from './pages/VoteBallot';
import VoteReceipt from './pages/VoteReceipt';
import VoteKiosk from './pages/VoteKiosk';
import AdminLogin from './pages/AdminLogin';
import AdminGuard from './components/AdminGuard';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/admin/elections', label: 'Elections', icon: 'vote' },
  { to: '/admin/voters', label: 'Voters', icon: 'people' },
  { to: '/admin/audit-log', label: 'Audit Log', icon: 'list' },
  { to: '/student_vote', label: 'Vote Now', icon: 'check' },
];

const iconPaths = {
  home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
  vote: <><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  people: <><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  list: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  check: <><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
};

const navIcons = {
  home: iconPaths.home,
  vote: iconPaths.vote,
  people: iconPaths.people,
  list: iconPaths.list,
  check: iconPaths.check,
};

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <h5 className="mb-0 fw-semibold">ElectionVote</h5>
          <small className="text-secondary">Online Voting System</small>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {navIcons[item.icon]}
                </svg>
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/student_vote" element={<VoteKiosk />} />
      <Route path="/vote" element={<VoteAccess />} />
      <Route path="/vote/access/:accessCode" element={<VoteBallot />} />
      <Route path="/vote/receipt/:receiptCode" element={<VoteReceipt />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/elections" element={<AdminGuard><Elections /></AdminGuard>} />
        <Route path="/admin/elections/:id/ballot" element={<AdminGuard><BallotSetup /></AdminGuard>} />
        <Route path="/admin/voters" element={<AdminGuard><Voters /></AdminGuard>} />
        <Route path="/admin/audit-log" element={<AdminGuard><AuditLog /></AdminGuard>} />
        <Route path="/elections/:id/results" element={<Results />} />
      </Route>
    </Routes>
  );
}
