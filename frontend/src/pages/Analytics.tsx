import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import { Activity, BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#FCE100', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#10b981'];

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex gap-2">
        <span className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3 h-3 bg-primary rounded-full animate-bounce"></span>
      </div>
    </div>
  );

  const intentData = stats.intentStats.map((item: any) => ({
    name: item.name.replace(/_/g, ' '),
    value: item.value
  }));

  const mockTimeData = [
    { time: '08:00', calls: 20 },
    { time: '10:00', calls: 45 },
    { time: '12:00', calls: 80 },
    { time: '14:00', calls: 120 },
    { time: '16:00', calls: 90 },
    { time: '18:00', calls: 40 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-title)' }}>System Analytics</h2>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">Deep dive into AI performance and call distribution.</p>
        </div>
        <div className="flex gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-black uppercase tracking-widest">
          <Activity size={14} /> Live Stream Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Intent Distribution */}
        <div className="glass-card p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/10">
              <PieIcon size={20} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-title)' }}>Intent Distribution</h3>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intentData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {intentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px',
                      color: 'var(--text-title)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color: 'var(--text-title)' }}>{stats.totalCalls}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Connections</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              {intentData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-bold uppercase tracking-wide group-hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
                  </div>
                  <span className="text-xs font-black" style={{ color: 'var(--text-title)' }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Volume */}
        <div className="glass-card p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/10">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-title)' }}>Peak Hourly Volume</h3>
          </div>
          
          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis 
                  dataKey="time" 
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
                <RechartsTooltip
                  cursor={{ fill: 'var(--glass-bg)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    color: 'var(--text-title)'
                  }}
                />
                <Bar 
                  dataKey="calls" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  animationBegin={200}
                  animationDuration={1500}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCE100" stopOpacity={1} />
                    <stop offset="100%" stopColor="#FCE100" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/10">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-title)' }}>Network Efficiency Trend</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTimeData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FCE100" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#FCE100" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis 
                dataKey="time" 
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-surface)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="calls" 
                stroke="#FCE100" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#areaGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
