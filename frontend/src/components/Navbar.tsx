import { Link, useLocation } from 'react-router';
import { ShieldCheck, LayoutDashboard, Users } from 'lucide-react';

export function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/candidates', label: 'Candidates', icon: Users },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white"
      style={{ height: '56px' }}
    >
      <div
        className="mx-auto flex h-full items-center justify-between px-6"
        style={{ maxWidth: '1152px' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: '#4F46E5' }}
          >
            <ShieldCheck size={18} color="white" />
          </div>
          <div className="flex flex-col leading-none">
            <span style={{ color: '#312E81', fontWeight: 700, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              FAIRHIRE
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
              AI Hiring Auditor
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
                style={{
                  background: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4F46E5' : '#374151',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  textDecoration: 'none',
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
        >
          <ShieldCheck size={13} />
          EEOC Compliance Tool
        </div>
      </div>
    </header>
  );
}