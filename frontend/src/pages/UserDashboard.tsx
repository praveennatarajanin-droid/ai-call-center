import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HeartPulse, AlertTriangle, Clock, Phone } from 'lucide-react';

interface HealthReport {
  id: string;
  symptoms: string;
  severity: string;
  summary: string;
  timestamp: string;
  call: {
    intent: string;
    transcript: string;
  };
}

export default function UserDashboard() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Mocking a fixed user ID for demo purposes
  const DEMO_USER_ID = 'demo-user-123'; 

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // In a real app we'd fetch for specific user
      // For demo, we'll fetch all admin reports to make sure we see data
      const res = await axios.get(`http://localhost:5000/api/health`);
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch health reports', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'emergency': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  if (loading) return <div className="text-white p-8">Loading Health Data...</div>;

  const emergencies = reports.filter(r => r.severity === 'emergency' || r.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Parent Health Overview</h1>
        <p className="text-slate-400 mt-2">Monitor recent AI interactions and health reports.</p>
      </div>

      {emergencies.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4 animate-pulse">
          <AlertTriangle className="text-red-500 mt-1" size={24} />
          <div>
            <h3 className="text-red-500 font-bold text-lg">Critical Alert Detected!</h3>
            <p className="text-red-400/80 text-sm mt-1">An emergency health concern was detected in the recent call.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${getSeverityColor(report.severity)}`}>
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg capitalize">{report.severity} Priority</h3>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(report.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {report.symptoms.split(',').map((symptom, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-black/40 text-slate-300 text-xs border border-white/5 capitalize">
                      {symptom.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">AI Summary</p>
                <p className="text-slate-300 text-sm leading-relaxed">{report.summary}</p>
              </div>

              {report.call?.transcript && (
                <div className="pt-4 border-t border-white/5 mt-4">
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                    <Phone size={12} /> Partial Transcript
                  </p>
                  <p className="text-slate-400 text-xs italic line-clamp-2">"{report.call.transcript}"</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <HeartPulse size={48} className="mx-auto mb-4 opacity-20" />
            <p>No health reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
