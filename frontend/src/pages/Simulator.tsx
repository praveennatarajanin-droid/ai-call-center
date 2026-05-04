import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Mic, Phone, Bot, User, Activity, Loader2 } from 'lucide-react';

const socket = io('http://localhost:5000');

export default function Simulator() {
  const [liveCalls, setLiveCalls] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('call_incoming', (data) => {
      setLiveCalls(prev => [...prev, { type: 'incoming', ...data, role: 'system', time: new Date() }]);
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveCalls]);

  // For manual testing if Twilio isn't connected
  const [testText, setTestText] = useState('');
  const handleManualTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testText || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      setLiveCalls(prev => [...prev, { type: 'transcription', text: testText, role: 'user', time: new Date() }]);
      const res = await axios.post('http://localhost:5000/api/call/analyze', { text: testText });
      setLiveCalls(prev => [...prev, { type: 'ai_response', response: res.data.response, intent: res.data.intent, role: 'ai', time: new Date() }]);
      setTestText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Live Call Monitor</h2>
          <p className="text-slate-400 text-sm">Real-time WebSocket feed of ongoing Twilio calls and AI processing.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Live Sync
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-panel rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone size={18} className="text-primary" /> Setup & Test
            </h3>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Twilio Webhook</p>
              <code className="text-xs text-primary break-all">ngrok http 5000/api/call/incoming</code>
            </div>

            <form onSubmit={handleManualTest} className="space-y-4 pt-6 border-t border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Simulate Voice Input</label>
                <textarea 
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Type what the customer would say..."
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none placeholder:text-slate-600"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!testText || isSubmitting}
                className="w-full bg-primary text-black rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(252,225,0,0.2)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                {isSubmitting ? 'AI Thinking...' : 'Submit Query'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-panel rounded-2xl p-6 flex flex-col h-[650px] border border-white/5">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <Activity size={20} className="text-primary" /> System Interaction Feed
            </h3>
            <button 
              onClick={() => setLiveCalls([])}
              className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              Clear Log
            </button>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
          >
            {liveCalls.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                  <Activity size={32} className="opacity-20" />
                </div>
                <p className="text-sm font-medium italic">Awaiting inbound communication data...</p>
              </div>
            ) : (
              liveCalls.map((evt, i) => {
                if (evt.type === 'incoming') {
                  return (
                    <div key={i} className="flex justify-center">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2">
                        <Phone size={12} /> Incoming: {evt.from} (SID: {evt.callSid.substring(0, 8)}...)
                      </div>
                    </div>
                  );
                }
                
                const isUser = evt.role === 'user';
                return (
                  <div key={i} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-top-2 duration-300`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUser ? 'bg-slate-800 border-slate-700 text-white shadow-lg' : 'bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5'
                    }`}>
                      {isUser ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%] space-y-2`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-slate-800 text-white rounded-tr-sm border border-slate-700' 
                          : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-sm'
                      }`}>
                        {evt.text || evt.response}
                      </div>
                      {evt.intent && (
                        <div className="flex gap-2">
                          <span className="text-[9px] uppercase font-black tracking-[0.15em] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                            Classified: {evt.intent}
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
