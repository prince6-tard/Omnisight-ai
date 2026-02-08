import {
  Map,
  Image,
  Wrench,
  Link2,
  Home,
  Satellite,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { useState } from 'react';

const Layout = ({ children }) => {
  const routerLocation = useRouterLocation();
  const { location, satelliteData, loading } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Satellite Explorer', href: '/explorer', icon: Satellite },
    { name: 'Crop Health', href: '/crop', icon: Image },
    { name: 'Disaster Risk', href: '/disaster', icon: Wrench },
    { name: 'Data Fusion', href: '/fusion', icon: Link2 },
    { name: 'AI Reports', href: '/reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-20' : 'w-64'} bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className={`p-4 ${collapsed ? 'px-3' : 'px-5'} border-b border-[var(--color-border)]`}>
          <Link to="/" className="flex items-center gap-2">
            <Satellite className="w-7 h-7 text-[var(--color-accent-light)] flex-shrink-0" />
            {!collapsed && (
              <div>
                <div className="text-lg font-bold text-[var(--color-accent-light)] leading-none">OmniSight AI</div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 tracking-wide uppercase">Satellite Intelligence</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = routerLocation.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-light)] border-l-2 border-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-[var(--color-accent-light)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]'}`} />
                {!collapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* System Status */}
        <div className={`${collapsed ? 'px-2' : 'px-4'} pb-4`}>
          {!collapsed && location && (
            <div className="bg-[var(--color-bg-card)] rounded-lg p-3 border border-[var(--color-border)] mb-3 text-xs">
              <p className="text-[var(--color-text-muted)] mb-1">Selected Location</p>
              <p className="font-mono text-[var(--color-text-primary)]">
                {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </p>
              {satelliteData && (
                <p className="text-[var(--color-success)] mt-1">
                  {satelliteData.summary.active_satellites}/{satelliteData.summary.total_satellites} satellites active
                </p>
              )}
            </div>
          )}

          <div className="bg-[var(--color-bg-card)] rounded-lg p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <Activity className={`w-5 h-5 text-[var(--color-accent-light)] ${loading ? 'animate-pulse' : ''}`} />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[var(--color-success)] rounded-full" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {loading ? 'Processing...' : 'System Online'}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">v2.4.0</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-3 w-full flex items-center justify-center py-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[var(--color-bg-primary)] relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[var(--color-accent)]/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
