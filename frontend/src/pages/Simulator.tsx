import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Mic, Phone, Bot, User, Activity } from 'lucide-react';

const socket = io('http://localhost:5000');

export default function Simulator() {
  const [liveCalls, setLiveCalls] = useState<any[]>([]);

  useEffect(() => {
    socket.on('call_incoming', (data) => {
      setLiveCalls(prev => [...prev, { type: 'incoming', ...data, time: new Date() }]);
    });

    socket.on('transcription', (data) => {
      setLiveCalls(prev => [...prev, { type: 'transcription', ...data, time: new Date() }]);
    });

    socket.on('ai_response', (data) => {
      setLiveCalls(prev => [...prev, { type: 'ai_response', ...data, time: new Date() }]);
    });

    return () => {
      socket.off('call_incoming');
      socket.off('transcription');
      socket.off('ai_response');
    };
  }, []);

  // For manual testing if Twilio isn't connected
  const [testText, setTestText] = useState('');
  const handleManualTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testText) return;
    try {
      setLiveCalls(prev => [...prev, { type: 'transcription', text: testText, role: 'user', time: new Date() }]);
      const res = await axios.post('http://localhost:5000/api/call/analyze', { text: testText });
      setLiveCalls(prev => [...prev, { type: 'ai_response', response: res.data.response, intent: res.data.intent, role: 'ai', time: new Date() }]);
      setTestText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Call Monitor</h2>
          <p className="text-slate-400 text-sm">Real-time WebSocket feed of ongoing Twilio calls and AI processing.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">
          <Activity size={14} className="animate-pulse" /> Live
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-panel border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Phone size={18} className="text-primary" /> Setup & Test
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              To test real VoIP, configure your Twilio Webhook to:<br/>
              <code className="text-primary mt-1 block">ngrok http 5000/api/call/incoming</code>
            </p>

            <form onSubmit={handleManualTest} className="space-y-4 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Manual Testing (No Twilio needed)</label>
                <textarea 
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Type a simulated voice query..."
                  rows={3}
                  className="w-full bg-dark border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!testText}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Mic size={16} /> Submit Text Query
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-panel border border-slate-800 rounded-2xl p-6 flex flex-col h-[600px]">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
            <Activity size={20} className="text-blue-400" /> WebSocket Stream
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {liveCalls.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Activity size={48} className="mb-4 opacity-20" />
                <p>Waiting for incoming calls or events...</p>
              </div>
            ) : (
              liveCalls.map((evt, i) => {
                if (evt.type === 'incoming') {
                  return (
                    <div key={i} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-4 py-2 rounded-lg flex items-center gap-2">
                      <Phone size={14} /> Incoming Call from {evt.from} (SID: {evt.callSid})
                    </div>
                  );
                }
                
                return (
                  <div key={i} className={`flex gap-4 ${evt.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      evt.role === 'user' ? 'bg-slate-700 text-white' : 'bg-primary/20 text-primary border border-primary/30'
                    }`}>
                      {evt.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    
                    <div className={`flex flex-col ${evt.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`p-3 rounded-2xl text-sm ${
                        evt.role === 'user' ? 'bg-slate-700 text-white rounded-tr-sm' : 'bg-primary/10 text-slate-200 border border-primary/20 rounded-tl-sm'
                      }`}>
                        {evt.text || evt.response}
                      </div>
                      {evt.intent && (
                        <div className="mt-1 flex gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Intent: {evt.intent}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
