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
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-title)' }}>Live Call Monitor</h2>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">Real-time WebSocket feed of ongoing Twilio calls and AI processing.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium border border-emerald-500/20">
          <Activity size={14} className="animate-pulse" /> Live Signal
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6" style={{ background: 'var(--bg-surface)' }}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-title)' }}>
              <Phone size={18} className="text-primary" /> Setup & Test
            </h3>
            
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              To test real VoIP, configure your Twilio Webhook to:<br/>
              <code className="text-primary mt-1 block font-bold">ngrok http 5000/api/call/incoming</code>
            </p>

            <form onSubmit={handleManualTest} className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Manual Testing Interface</label>
                <textarea 
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Type a simulated voice query..."
                  rows={3}
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-title)' }}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!testText}
                className="w-full bg-primary text-black rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Mic size={16} /> Submit Text Query
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[600px]" style={{ background: 'var(--bg-surface)' }}>
          <h3 className="text-lg font-bold mb-6 flex items-center gap-3 border-b pb-4" style={{ color: 'var(--text-title)', borderColor: 'var(--border-color)' }}>
            <Activity size={20} className="text-blue-500" /> WebSocket Stream
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {liveCalls.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                <div className="relative">
                  <Activity size={64} className="mb-6 opacity-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  </div>
                </div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Waiting for connection signals...</p>
              </div>
            ) : (
              liveCalls.map((evt, i) => {
                if (evt.type === 'incoming') {
                  return (
                    <div key={i} className="bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      Incoming Call from {evt.from}
                      <span className="ml-auto opacity-50">SID: {evt.callSid.substring(0, 8)}...</span>
                    </div>
                  );
                }
                
                const isUser = evt.role === 'user';
                return (
                  <div key={i} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      isUser ? 'bg-zinc-800 text-white' : 'bg-primary text-black'
                    }`}>
                      {isUser ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${
                        isUser 
                          ? 'bg-zinc-800 text-white rounded-tr-sm' 
                          : 'bg-primary/10 border border-primary/20 rounded-tl-sm'
                      }`} style={{ color: isUser ? '#fff' : 'var(--text-title)' }}>
                        {evt.text || evt.response}
                      </div>
                      {evt.intent && (
                        <div className="mt-2 flex gap-2">
                          <span className="text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded-lg bg-primary/20 text-primary border border-primary/20">
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
