import { createBrowserRouter } from 'react-router';
import { Navbar } from './components/Navbar';
import { Outlet } from 'react-router';
import { Dashboard } from './pages/Dashboard';
import { AuditDetail } from './pages/AuditDetail';
import { CandidateList } from './pages/CandidateList';

function Root() {
  return (
    <div className="min-h-screen" style={{ background: '#F9FAFB' }}>
      <Navbar />
      <Outlet />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p style={{ fontSize: '48px', fontWeight: 700, color: '#E5E7EB', fontFamily: 'Inter, sans-serif' }}>
          404
        </p>
        <p style={{ fontSize: '16px', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
          Page not found
        </p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'audit/:id', Component: AuditDetail },
      { path: 'candidates', Component: CandidateList },
      { path: '*', Component: NotFound },
    ],
  },
]);
