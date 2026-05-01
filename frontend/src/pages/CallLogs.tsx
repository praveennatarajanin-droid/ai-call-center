import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Search, Filter, Phone, Clock, Tag, X, 
  MessageSquare, TrendingUp, TrendingDown, Minus, 
  ChevronRight, Calendar, User, Info
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CallLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get('http://localhost:5000/api/calls')
      .then(res => setLogs(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLogs = logs.filter((log: any) => 
    log.intent.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user?.phone && log.user.phone.includes(searchTerm))
  );

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return <TrendingUp size={14} className="text-emerald-400" />;
      case 'negative': return <TrendingDown size={14} className="text-rose-400" />;
      default: return <Minus size={14} className="text-slate-400" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'transferred': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case 'failed': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="relative h-full flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Communication Intelligence
          </h2>
          <p className="text-slate-400 mt-1">Analyzing and archiving automated customer interactions.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, intent, or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
            />
          </div>
          <button className="glass-button flex items-center gap-2">
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 min-h-0 flex gap-6">
        <div className={cn(
          "flex-1 bg-panel border border-white/5 rounded-2xl overflow-hidden flex flex-col transition-all duration-500",
          selectedLog && "hidden lg:flex"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-[11px] uppercase tracking-widest text-slate-500">
                  <th className="p-5 font-semibold">Customer</th>
                  <th className="p-5 font-semibold">Classification</th>
                  <th className="p-5 font-semibold">Insights</th>
                  <th className="p-5 font-semibold">Duration</th>
                  <th className="p-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-8 border-b border-white/5">
                        <div className="h-4 bg-white/5 rounded w-3/4"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLogs.map((log: any) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className={cn(
                      "group cursor-pointer hover:bg-white/5 transition-all duration-300",
                      selectedLog?.id === log.id && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-slate-400 group-hover:border-primary/30 group-hover:text-primary transition-all">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                            {log.user?.name || 'Guest User'}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Phone size={10} /> {log.user?.phone || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div>
                        <span className="text-xs font-medium text-slate-300 block mb-1">
                          {log.intent}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-500 border border-white/5 uppercase tracking-wider font-bold">
                          {log.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                          {getSentimentIcon(log.sentiment)}
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{log.sentiment}</span>
                        </div>
                        <span className={cn("status-badge", getStatusStyles(log.status))}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Clock size={12} className="text-slate-500" />
                          {Math.floor(log.duration / 60)}m {log.duration % 60}s
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
                          <Calendar size={10} />
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button className="p-2 rounded-lg bg-white/5 text-slate-500 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Search size={40} className="opacity-20" />
                        <p>No records found matching your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Side Panel */}
        {selectedLog && (
          <div className="w-full lg:w-[400px] bg-panel border border-white/10 rounded-2xl flex flex-col animate-in slide-in-from-right-8 duration-500 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Info size={18} className="text-primary" />
                Call Intelligence
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Summary Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <MessageSquare size={14} /> Executive Summary
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-sm text-slate-300 leading-relaxed italic">
                  "{selectedLog.summary}"
                </div>
              </section>

              {/* Metadata Grid */}
              <section className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Sentiment</p>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(selectedLog.sentiment)}
                    <span className="text-sm font-semibold">{selectedLog.sentiment}</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
                  <span className={cn("text-xs font-bold", selectedLog.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400')}>
                    {selectedLog.status}
                  </span>
                </div>
              </section>

              {/* Transcript Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <Tag size={14} /> Interaction Transcript
                </div>
                <div className="space-y-4">
                  {selectedLog.transcript.split('. ').map((line: string, i: number) => {
                    const isAI = line.startsWith('AI:');
                    const isUser = line.startsWith('User:');
                    return (
                      <div key={i} className={cn(
                        "p-3 rounded-xl text-xs flex gap-3",
                        isAI ? "bg-primary/10 border border-primary/20" : "bg-white/5 border border-white/10 ml-4"
                      )}>
                        <div className="flex-1">
                          <span className="font-bold uppercase text-[9px] block mb-1 opacity-50">
                            {isAI ? 'Agent' : isUser ? 'Customer' : 'Narrative'}
                          </span>
                          <span className="text-slate-300">{line.replace(/AI:|User:/, '').trim()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5">
              <button className="w-full py-3 bg-primary text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                Download Audio & Transcript
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

