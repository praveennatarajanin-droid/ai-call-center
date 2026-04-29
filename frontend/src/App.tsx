import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Users, Database, BarChart3, Settings, PhoneIncoming } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CallLogs from './pages/CallLogs';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Simulator from './pages/Simulator';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: PhoneCall, label: 'Call Logs', path: '/calls' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: PhoneIncoming, label: 'Simulator', path: '/simulator' },
  ];

  return (
    <div className="w-64 bg-dark border-r border-slate-800 flex flex-col h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
          AI
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          NexusCall
        </span>
      </div>
      
      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </div>
      </div>
    </div>
  );
};

const Topbar = () => {
  return (
    <header className="h-20 bg-darker/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">System Control</h1>
        <p className="text-sm text-slate-400">AI Call Centre Automation System</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-sm text-emerald-400 font-medium">System Online</span>
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 ml-4"></div>
      </div>
    </header>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-darker text-slate-200 selection:bg-primary/30">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8 relative z-0">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calls" element={<CallLogs />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/simulator" element={<Simulator />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
