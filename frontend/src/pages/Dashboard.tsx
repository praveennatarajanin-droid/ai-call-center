import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, PhoneCall, BrainCircuit, Activity, 
  ArrowUpRight, ArrowDownRight, Zap, Target 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const chartData = [
  { name: '08:00', calls: 120, satisfaction: 94 },
  { name: '10:00', calls: 350, satisfaction: 96 },
  { name: '12:00', calls: 580, satisfaction: 92 },
  { name: '14:00', calls: 490, satisfaction: 95 },
  { name: '16:00', calls: 620, satisfaction: 97 },
  { name: '18:00', calls: 310, satisfaction: 98 },
  { name: '20:00', calls: 180, satisfaction: 96 },
];

const StatCard = ({ title, value, icon: Icon, trend, isPositive }: any) => (
  <div className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 animate-glow">
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={120} />
    </div>
    
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    
    <div className="space-y-1">
      <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
      <h2 className="text-4xl font-bold text-white tracking-tight">{value}</h2>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    totalCalls: 0, 
    activeUsers: 0, 
    aiPerformance: 0,
    intentStats: [] 
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/analytics', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      setStats(res.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">Systems Overview</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time intelligence dashboard is active and monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <button className="glass-button">Export Report</button>
          <button className="px-5 py-2.5 bg-primary text-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(252,225,0,0.3)] transition-all active:scale-95">
            System Config
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Throughput" value={stats.totalCalls} icon={PhoneCall} trend="+12.4%" isPositive={true} />
        <StatCard title="Retention" value={stats.activeUsers} icon={Users} trend="+8.2%" isPositive={true} />
        <StatCard title="Accuracy" value={`${stats.aiPerformance}%`} icon={Target} trend="+0.8%" isPositive={true} />
        <StatCard title="Latency" value="142ms" icon={Zap} trend="-4.1%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Volume Chart */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Activity className="text-primary" size={20} />
              Traffic Analytics
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Volume
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FCE100" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FCE100" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.2)" 
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 10, 10, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: '#FCE100', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#FCE100" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCalls)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Intent Distribution */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <BrainCircuit className="text-primary" size={20} />
            Intent Classification
          </h3>
          <div className="space-y-6">
            {stats.intentStats.map((item: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-slate-400">{item.name}</span>
                  <span className="text-white">{item.value}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-1000" 
                    style={{ width: `${(item.value / stats.totalCalls) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {stats.intentStats.length === 0 && (
              <p className="text-center text-slate-500 py-12 italic">Awaiting classification data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

