import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, PhoneCall, Users, BarChart3, 
  Settings, PhoneIncoming, Bell, Search, User, Activity, HeartPulse, LogOut, Radio
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

const Sidebar = ({ role }: { role: string }) => {
  const location = useLocation();

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Systems', path: '/admin' },
    { icon: Radio, label: 'Live Calls', path: '/admin/live-calls' },
    { icon: PhoneCall, label: 'History', path: '/admin/history' },
    { icon: Users, label: 'Directory', path: '/admin/directory' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: PhoneIncoming, label: 'Simulator', path: '/admin/simulator' },
  ];

  const userNavItems = [
    { icon: HeartPulse, label: 'Health Overview', path: '/' },
  ];

  const navItems = role === 'ADMIN' ? adminNavItems : userNavItems;

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path;
  };

  return (
    <div className="w-72 bg-black border-r border-white/10 flex flex-col h-screen relative z-[999] pointer-events-auto">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-black text-2xl shadow-xl">
          N
        </div>
        <div>
          <span className="text-xl font-bold block leading-none text-white">Nexus</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Health Systems</span>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          {role === 'ADMIN' ? 'Core Architecture' : 'Monitoring'}
        </p>
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => console.log("Sidebar clicked: " + item.label)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group border block no-underline cursor-pointer pointer-events-auto ${
                isActive(item.path) 
                  ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(252,225,0,0.2)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <item.icon size={20} className={`transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-black' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
          <p className="text-xs font-bold text-white mb-1 text-center">System Healthy</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[98%]"></div>
            </div>
          </div>
        </div>
        
        {role === 'ADMIN' && (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
            <Settings size={20} />
            <span className="font-semibold text-sm">Parameters</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Topbar = ({ role, setRole }: { role: string, setRole: (r: string) => void }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className="h-24 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search system nodes..." 
            className="bg-transparent border-none text-sm text-white focus:outline-none w-48"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <WebVoiceButton userType={role === 'ADMIN' ? 'admin' : 'parent'} />
        <div className="flex items-center gap-4 border-r border-white/10 pr-6 mr-2 text-slate-400">
           <Bell size={20} />
           <Activity size={20} />
        </div>

        {/* ROLE TOGGLE FOR DEMO */}
        <div className="flex items-center gap-3 pr-4 border-r border-white/10 mr-2">
          <span className="text-xs font-bold text-slate-500">View as:</span>
          <select 
            value={role} 
            onChange={(e) => {
              const newRole = e.target.value;
              setRole(newRole);
              localStorage.setItem('role', newRole);
              navigate(newRole === 'ADMIN' ? '/admin' : '/');
            }}
            className="bg-white/5 border border-white/10 rounded-lg text-white text-xs px-2 py-1 outline-none cursor-pointer"
          >
            <option value="USER">Child / User</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={handleLogout}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
              {role === 'ADMIN' ? 'Commander' : 'Family Member'}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 justify-end group-hover:text-red-400">
              <LogOut size={10} /> Logout
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-red-400">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

const LayoutWrapper = ({ children, role, setRole }: { children: React.ReactNode, role: string, setRole: (r: string) => void }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-black text-slate-200 selection:bg-yellow-400/30">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Topbar role={role} setRole={setRole} />
        <main className="flex-1 overflow-y-auto p-10 relative z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || role;

  if (!token || userRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const [role, setRole] = useState('ADMIN'); 
  const location = useLocation();

  useEffect(() => {
    const savedRole = localStorage.getItem('role');
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  // Force scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes key={location.pathname}>
      <Route path="/login" element={<Login />} />
      
      {/* Flat Route Structure with Layout Wrapper */}
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute role={role}>
          <LayoutWrapper role={role} setRole={setRole}><Dashboard /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/admin/live-calls" element={
        <ProtectedRoute role={role}>
          <LayoutWrapper role={role} setRole={setRole}><LiveCalls /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/admin/history" element={
        <ProtectedRoute role={role}>
          <LayoutWrapper role={role} setRole={setRole}><CallLogs /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/admin/directory" element={
        <ProtectedRoute role={role}>
          <LayoutWrapper role={role} setRole={setRole}><Customers /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute role={role}>
          <LayoutWrapper role={role} setRole={setRole}><Analytics /></LayoutWrapper>
        </ProtectedRoute>
      } />
      <Route path="/admin/simulator" element={
        <ProtectedRoute role={role}>
          <LayoutWrapper role={role} setRole={setRole}><Simulator /></LayoutWrapper>
        </ProtectedRoute>
      } />

      {/* User Routes */}
      <Route path="/" element={<LayoutWrapper role={role} setRole={setRole}><UserDashboard /></LayoutWrapper>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={role === 'ADMIN' ? "/admin" : "/"} replace />} />
    </Routes>
  );
}
