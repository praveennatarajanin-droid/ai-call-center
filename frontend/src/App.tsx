import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, PhoneCall, Users, BarChart3, 
  Settings, PhoneIncoming, Bell, Search, User, Activity
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CallLogs from './pages/CallLogs';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Simulator from './pages/Simulator';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Systems', path: '/' },
    { icon: PhoneCall, label: 'Intelligence', path: '/calls' },
    { icon: Users, label: 'Directory', path: '/customers' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: PhoneIncoming, label: 'Simulator', path: '/simulator' },
  ];

  return (
    <div className="w-72 bg-black/50 border-r border-white/5 flex flex-col h-screen backdrop-blur-3xl z-20">
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-black text-2xl shadow-xl">
          N
        </div>
        <div>
          <span className="text-xl font-bold block leading-none text-white">Nexus</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Call Systems</span>
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-1.5 mt-4">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Core Architecture</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-500 group ${
                isActive 
                  ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-6">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <p className="text-xs font-bold text-white mb-1 text-center">System Healthy</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[98%]"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          <Settings size={20} />
          <span className="font-semibold text-sm">Parameters</span>
        </div>
      </div>
    </div>
  );
};

const Topbar = () => {
  return (
    <header className="h-24 bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-10">
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
        <div className="flex items-center gap-4 border-r border-white/10 pr-6 mr-2 text-slate-400">
           <Bell size={20} />
           <Activity size={20} />
        </div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">Commander</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Project Root</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-yellow-400">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-black text-slate-200 selection:bg-yellow-400/30">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-10 relative z-0">
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
