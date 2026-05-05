import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, PhoneCall, BrainCircuit, Activity, 
  ArrowUpRight, ArrowDownRight, Zap, Target,
  X, Download, Settings2, Bell, Shield, Cpu, Globe, Save
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
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
  <div className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color: 'var(--text-main)' }}>
      <Icon size={120} />
    </div>
    
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    
    <div className="space-y-1">
      <h3 style={{ color: 'var(--text-muted)' }} className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
      <h2 style={{ color: 'var(--text-title)' }} className="text-4xl font-bold tracking-tight">{value}</h2>
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
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    notifications: true,
    aiMonitoring: true,
    autoScaling: false,
    globalRelay: true,
    maxConcurrentCalls: '50',
    aiConfidenceThreshold: '85',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/analytics', { headers: { Authorization: `Bearer ${token}` } }).then(res => {
      setStats(res.data);
    }).catch(console.error);
  }, []);

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Calls', stats.totalCalls],
      ['Active Users', stats.activeUsers],
      ['AI Performance', `${stats.aiPerformance}%`],
      ['Latency', '142ms'],
      [],
      ['Hour', 'Call Volume', 'Satisfaction'],
      ...chartData.map(d => [d.name, d.calls, d.satisfaction]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggle = (key: keyof typeof config) =>
    setConfig(c => ({ ...c, [key]: !c[key] }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ── System Config Modal ──────────────────────────────────── */}
      {showConfig && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowConfig(false)}
        >
          <div
            style={{ width: 480, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 32, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(252,225,0,0.1)', border: '1px solid rgba(252,225,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings2 size={20} color="#FCE100" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-title)' }}>System Config</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nexus Health — Core Parameters</p>
                </div>
              </div>
              <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {/* Toggles */}
            {[
              { key: 'notifications', icon: Bell, label: 'Alert Notifications', desc: 'Push alerts for critical events' },
              { key: 'aiMonitoring', icon: Cpu, label: 'AI Monitoring', desc: 'Real-time AI call analysis' },
              { key: 'autoScaling', icon: Shield, label: 'Auto Scaling', desc: 'Dynamic resource allocation' },
              { key: 'globalRelay', icon: Globe, label: 'Global Relay', desc: 'Multi-region call routing' },
            ].map(({ key, icon: Icon, label, desc }) => {
              const on = config[key as keyof typeof config] as boolean;
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Icon size={16} color={on ? '#FCE100' : 'var(--text-muted)'} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-title)' }}>{label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</p>
                    </div>
                  </div>
                  <div
                    onClick={() => toggle(key as keyof typeof config)}
                    style={{ width: 44, height: 24, borderRadius: 100, background: on ? '#FCE100' : 'var(--border-color)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: on ? '#000' : 'var(--text-muted)', transition: 'left 0.2s' }} />
                  </div>
                </div>
              );
            })}

            {/* Number inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
              {[
                { key: 'maxConcurrentCalls', label: 'Max Concurrent Calls' },
                { key: 'aiConfidenceThreshold', label: 'AI Confidence Threshold (%)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
                  <input
                    type="number"
                    value={config[key as keyof typeof config] as string}
                    onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
                    style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-title)', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>

            {/* Save */}
            <button
              onClick={() => { alert('Configuration saved!'); setShowConfig(false); }}
              style={{ marginTop: 24, width: '100%', padding: '12px 0', background: '#FCE100', color: '#000', fontWeight: 800, fontSize: 14, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s' }}
            >
              <Save size={16} /> Save Configuration
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">Systems Overview</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time intelligence dashboard is active and monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <button className="glass-button" onClick={handleExportReport} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={15} /> Export Report
            </button>
            <button
              onClick={() => setShowConfig(true)}
              className="px-5 py-2.5 bg-primary text-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(252,225,0,0.3)] transition-all active:scale-95"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Settings2 size={15} /> System Config
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
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: 'var(--text-title)'
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
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                  <span style={{ color: 'var(--text-title)' }}>{item.value}</span>
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
              <p style={{ color: 'var(--text-muted)' }} className="text-center py-12 italic">Awaiting classification data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

