import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Search, Filter, Phone, Clock, Tag, X, 
  MessageSquare, TrendingUp, TrendingDown, Minus, 
  ChevronRight, Calendar, User, Info, CloudCheck, CloudOff, RefreshCcw,
  ShieldCheck, ArrowRight
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
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setIsLoading(true);
    axios.get('http://localhost:5000/api/calls')
      .then(res => setLogs(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const filteredLogs = logs.filter((log: any) => 
    log.intent.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user?.phone && log.user.phone.includes(searchTerm))
  );

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return <TrendingUp size={14} className="text-emerald-500" />;
      case 'negative': return <TrendingDown size={14} className="text-rose-500" />;
      default: return <Minus size={14} className="text-slate-400" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'transferred': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'failed': return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 text-slate-300">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            Communication Intelligence
          </h2>
          <p className="text-sm text-slate-500">Enterprise Audit Log & AI Classification Engine</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              type="text" 
              placeholder="Filter by intent, customer, or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-slate-600 transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-colors">
            <Filter size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Table Section */}
        <div className={cn(
          "flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col transition-all duration-300 shadow-sm",
          selectedLog && "hidden xl:flex" // Hide table on smaller screens when detail is open
        )}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Caller Identity</th>
                  <th className="px-6 py-4">Classification</th>
                  <th className="px-6 py-4">Sentiment</th>
                  <th className="px-6 py-4 text-right">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse"><td colSpan={4} className="p-8 border-b border-slate-800"><div className="h-4 bg-slate-800 rounded w-1/2"></div></td></tr>
                  ))
                ) : filteredLogs.map((log: any) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className={cn(
                      "group cursor-pointer hover:bg-slate-800/40 transition-colors",
                      selectedLog?.id === log.id && "bg-slate-800 border-l-4 border-l-primary"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                          {log.user?.name?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{log.user?.name || 'Guest User'}</p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{log.user?.phone || 'ANONYMOUS'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-300">{log.intent}</p>
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{log.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-950 border border-slate-800 w-fit">
                        {getSentimentIcon(log.sentiment)}
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{log.sentiment}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded hover:bg-slate-700 text-slate-500 transition-colors">
                        <ArrowRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Side Panel - Fixed Professional Layout */}
        {selectedLog && (
          <div className="w-full xl:w-[480px] bg-slate-900 border border-slate-800 rounded-lg flex flex-col shadow-2xl animate-in slide-in-from-right-4 duration-300">
            {/* Panel Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(252,225,0,0.5)]"></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Record Intelligence</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
              {/* Meta Summary */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-sm font-bold text-slate-200">
                        {Math.floor(selectedLog.duration / 60)}m {selectedLog.duration % 60}s
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Captured On</p>
                    <div className="flex items-center gap-2 justify-end">
                      <Calendar size={14} className="text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {format(new Date(selectedLog.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment Profile */}
              <section className="space-y-4 bg-slate-950 p-4 border border-slate-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sentiment Index</div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      selectedLog.sentimentScore > 0.6 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      selectedLog.sentimentScore > 0.4 ? "bg-slate-500/10 text-slate-400 border border-slate-500/20" :
                      "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    )}>
                      {selectedLog.sentimentScore > 0.6 ? 'Satisfactory' : selectedLog.sentimentScore > 0.4 ? 'Neutral' : 'Critical'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-end gap-4">
                  <div className="text-3xl font-black text-white font-mono">
                    {Math.round(selectedLog.sentimentScore * 100)}%
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          selectedLog.sentimentScore > 0.6 ? "bg-emerald-500" :
                          selectedLog.sentimentScore > 0.4 ? "bg-slate-500" :
                          "bg-rose-500"
                        )}
                        style={{ width: `${selectedLog.sentimentScore * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-slate-600 font-medium">
                  Interaction confidence score based on real-time NLP analysis.
                </p>
              </section>


              {/* Summary Block */}
              <section className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} /> AI Executive Summary
                </p>
                <div className="p-4 bg-slate-950 border-l-2 border-primary text-sm text-slate-300 leading-relaxed font-medium">
                  {selectedLog.summary}
                </div>
              </section>

              {/* Transcription Log */}
              <section className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={14} /> Full Conversation Log
                </p>
                <div className="space-y-3 font-mono">
                  {selectedLog.transcript.split('. ').map((line: string, i: number) => {
                    const isAI = line.toLowerCase().includes('ai:');
                    return (
                      <div key={i} className={cn(
                        "p-3 rounded text-[11px] border leading-normal",
                        isAI ? "bg-slate-800/40 border-slate-700" : "bg-slate-950 border-slate-800 ml-4"
                      )}>
                        <span className={cn("font-black text-[9px] block mb-1 uppercase", isAI ? "text-primary" : "text-slate-500")}>
                          {isAI ? 'AGENT SYSTEM' : 'CUSTOMER END'}
                        </span>
                        <span className="text-slate-300">{line.replace(/AI:|User:/i, '').trim()}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded uppercase tracking-widest transition-all">
                Export Compliance Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

