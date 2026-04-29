import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, PhoneCall, BrainCircuit, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', calls: 400 },
  { name: 'Tue', calls: 300 },
  { name: 'Wed', calls: 550 },
  { name: 'Thu', calls: 450 },
  { name: 'Fri', calls: 600 },
  { name: 'Sat', calls: 200 },
  { name: 'Sun', calls: 150 },
];

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-panel border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={64} />
    </div>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon size={24} />
      </div>
      <h3 className="text-slate-400 font-medium">{title}</h3>
    </div>
    <div className="flex items-end gap-3">
      <h2 className="text-4xl font-bold text-white tracking-tight">{value}</h2>
      <span className="text-emerald-400 text-sm font-medium mb-1">{trend}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ totalCalls: 0, activeUsers: 0, aiPerformance: 0 });

  useEffect(() => {
    axios.get('http://localhost:5000/api/analytics').then(res => {
      setStats(res.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Calls" value={stats.totalCalls} icon={PhoneCall} trend="+12.5%" />
        <StatCard title="Active Users" value={stats.activeUsers} icon={Users} trend="+5.2%" />
        <StatCard title="AI Performance" value={`${stats.aiPerformance}%`} icon={BrainCircuit} trend="+1.1%" />
        <StatCard title="System Health" value="99.9%" icon={Activity} trend="Stable" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-panel border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Call Volume Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-panel border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Recent AI Actions</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Intent Resolved</p>
                  <p className="text-xs text-slate-400">Payment inquiry automatically handled</p>
                </div>
                <div className="ml-auto text-xs text-slate-500">2m ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
