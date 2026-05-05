import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, PhoneCall, Users, BarChart3, 
  Settings, PhoneIncoming, Bell, Search, User, Activity, HeartPulse, LogOut, Radio,
  Sun, Moon
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CallLogs from './pages/CallLogs';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Simulator from './pages/Simulator';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import LiveCalls from './pages/LiveCalls';
import WebVoiceButton from './components/WebVoiceButton';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ role }: { role: string }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Systems',   path: '/admin' },
    { icon: Radio,           label: 'Live Calls', path: '/admin/live-calls' },
    { icon: PhoneCall,       label: 'History',    path: '/admin/history' },
    { icon: Users,           label: 'Directory',  path: '/admin/directory' },
    { icon: BarChart3,       label: 'Analytics',  path: '/admin/analytics' },
    { icon: PhoneIncoming,   label: 'Simulator',  path: '/admin/simulator' },
  ];

  const userNavItems = [
    { icon: HeartPulse, label: 'Health Overview', path: '/user' },
  ];

  const navItems = role === 'ADMIN' ? adminNavItems : userNavItems;

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path;
  };

  return (
    <div style={{ 
      width: '288px', 
      minWidth: '288px', 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      height: '100vh', 
      zIndex: 200, 
      background: 'var(--sidebar-bg)', 
      borderRight: '1px solid var(--border-color)', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s'
    }}>
      {/* Logo */}
      <div style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #facc15, #ca8a04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '24px', color: '#000' }}>
          N
        </div>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-title)', display: 'block' }}>Nexus</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Health Systems</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
        <p style={{ padding: '0 16px 16px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          {role === 'ADMIN' ? 'Core Architecture' : 'Monitoring'}
        </p>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '6px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 0.2s',
                background: active ? '#FCE100' : 'transparent',
                color: active ? '#000' : 'var(--text-muted)',
                border: active ? '1px solid #FCE100' : '1px solid transparent',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 201,
              }}
            >
              <item.icon size={20} style={{ color: active ? '#000' : 'var(--text-muted)', flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ padding: '24px' }}>
        <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-title)', textAlign: 'center', marginBottom: '8px' }}>System Healthy</p>
          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '98%', background: '#10b981', borderRadius: '100px' }} />
          </div>
        </div>
        {role === 'ADMIN' && (
          <Link 
            to="/admin/simulator"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              color: isActive('/admin/simulator') ? '#000' : 'var(--text-muted)', 
              background: isActive('/admin/simulator') ? '#FCE100' : 'transparent',
              textDecoration: 'none',
              cursor: 'pointer', 
              transition: 'all 0.2s' 
            }}
            onMouseOver={(e) => { if(!isActive('/admin/simulator')) e.currentTarget.style.background = 'var(--glass-bg)'; }}
            onMouseOut={(e) => { if(!isActive('/admin/simulator')) e.currentTarget.style.background = 'transparent'; }}
          >
            <Settings size={20} style={{ color: isActive('/admin/simulator') ? '#000' : 'var(--text-muted)' }} />
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Parameters</span>
          </Link>
        )}
      </div>
    </div>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar = ({ role, setRole, theme, toggleTheme }: { role: string; setRole: (r: string) => void, theme: string, toggleTheme: () => void }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <header style={{ 
      height: '80px', 
      background: 'var(--topbar-bg)', 
      backdropFilter: 'blur(20px)', 
      borderBottom: '1px solid var(--border-color)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 40px', 
      flexShrink: 0,
      transition: 'all 0.3s',
      position: 'relative',
      zIndex: 500
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search system nodes..."
          style={{ background: 'transparent', border: 'none', fontSize: '14px', color: 'var(--text-title)', outline: 'none', width: '180px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <WebVoiceButton userType={role === 'ADMIN' ? 'admin' : 'parent'} />

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{ 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '10px', 
            padding: '8px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-title)',
            transition: 'all 0.2s'
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderRight: '1px solid var(--border-color)', paddingRight: '24px', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <Activity size={20} />
        </div>

        {/* User / Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={handleLogout}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)' }}>{role === 'ADMIN' ? 'Commander' : 'Family Member'}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <LogOut size={10} /> Logout
            </p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Admin Guard + Layout ────────────────────────────────────────────────────
const RequireAdmin = ({ role, setRole, theme, toggleTheme }: { role: string; setRole: (r: string) => void, theme: string, toggleTheme: () => void }) => {
  const token = localStorage.getItem('token');
  const savedRole = localStorage.getItem('role');

  if (!token || savedRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'all 0.3s' }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, marginLeft: '288px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Topbar role={role} setRole={setRole} theme={theme} toggleTheme={toggleTheme} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── User Layout ──────────────────────────────────────────────────────────────
const UserLayout = ({ role, setRole, theme, toggleTheme }: { role: string; setRole: (r: string) => void, theme: string, toggleTheme: () => void }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'all 0.3s' }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, marginLeft: '288px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Topbar role={role} setRole={setRole} theme={theme} toggleTheme={toggleTheme} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState<string>(() => {
    return localStorage.getItem('role') || 'ADMIN';
  });

  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Admin section — shared layout, child pages swap via <Outlet /> */}
      <Route element={<RequireAdmin role={role} setRole={setRole} theme={theme} toggleTheme={toggleTheme} />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/live-calls" element={<LiveCalls />} />
        <Route path="/admin/history" element={<CallLogs />} />
        <Route path="/admin/directory" element={<Customers />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/simulator" element={<Simulator />} />
      </Route>

      {/* User section */}
      <Route element={<UserLayout role={role} setRole={setRole} theme={theme} toggleTheme={toggleTheme} />}>
        <Route path="/user" element={<UserDashboard />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={localStorage.getItem('token') && localStorage.getItem('role') === 'ADMIN' ? '/admin' : '/login'}
            replace
          />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
