import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, Filter, Phone, Clock, Tag } from 'lucide-react';

export default function CallLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/calls').then(res => setLogs(res.data)).catch(console.error);
  }, []);

  const filteredLogs = logs.filter((log: any) => 
    log.intent.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (log.user?.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user?.phone && log.user.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Call Logs</h2>
          <p className="text-slate-400 text-sm">View and manage all automated AI call interactions.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="p-2 border border-slate-800 rounded-xl bg-dark text-slate-400 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-panel border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-800 text-sm text-slate-400">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Intent Detected</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log: any) => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                        <Phone size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{log.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{log.user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-primary" />
                      <span className="text-sm text-slate-300 capitalize">{log.intent.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock size={14} />
                      {Math.floor(log.duration / 60)}m {log.duration % 60}s
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Resolved
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
