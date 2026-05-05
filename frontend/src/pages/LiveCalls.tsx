import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { PhoneCall, Activity, MessageSquare, Send, PlayCircle, ShieldAlert, User, Cpu } from 'lucide-react';

const socket = io('http://localhost:5000');

interface LiveCall {
  callSid: string;
  from: string;
  status: string;
  transcript: string;
  intent: string;
  category: string;
  priority: string;
}

export default function LiveCalls() {
  const [activeCalls, setActiveCalls] = useState<Record<string, LiveCall>>({});
  const [replyText, setReplyText] = useState('');
  const [selectedSid, setSelectedSid] = useState<string | null>(null);

  useEffect(() => {
    socket.on('call_incoming', (data) => {
      setActiveCalls((prev) => ({
        ...prev,
        [data.callSid]: { callSid: data.callSid, from: data.from, status: 'Ringing/Active', transcript: '', intent: '', category: '', priority: '' }
      }));
    });

    socket.on('transcription', (data) => {
      setActiveCalls((prev) => {
        if (!prev[data.callSid]) return prev;
        return {
          ...prev,
          [data.callSid]: { ...prev[data.callSid], transcript: prev[data.callSid].transcript + ' User: ' + data.text }
        };
      });
    });

    socket.on('ai_response', (data) => {
      setActiveCalls((prev) => {
        if (!prev[data.callSid]) return prev;
        return {
          ...prev,
          [data.callSid]: { 
            ...prev[data.callSid], 
            transcript: prev[data.callSid].transcript + ' AI: ' + data.response,
            intent: data.intent || prev[data.callSid].intent,
            category: data.category || prev[data.callSid].category,
            priority: data.priority || prev[data.callSid].priority
          }
        };
      });
    });

    return () => {
      socket.off('call_incoming');
      socket.off('transcription');
      socket.off('ai_response');
    };
  }, []);

  const handleReply = async (callSid: string) => {
    if (!replyText.trim()) return;
    
    // Handle Demo Mode SIDs locally to prevent API errors
    if (callSid.startsWith('demo-')) {
      setActiveCalls(prev => {
        const call = prev[callSid];
        if (!call) return prev;
        return {
          ...prev,
          [callSid]: {
            ...call,
            transcript: call.transcript + '\n AI: (Admin Override) ' + replyText
          }
        };
      });
      setReplyText('');
      alert('Manual override signal transmitted to node.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/call/reply', { callSid, message: replyText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplyText('');
      alert('Reply sent successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to send reply');
    }
  };

  const simulateDemo = () => {
    const sid = 'demo-' + Math.random().toString(36).substr(2, 9);
    setActiveCalls(prev => ({
      ...prev,
      [sid]: {
        callSid: sid,
        from: '+1 (555) 012-3456',
        status: 'LIVE - INTERCEPTION ACTIVE',
        transcript: ' User: Hello, I need help with my connection.\n AI: I can help with that. What is your account ID?',
        intent: 'Support',
        category: 'Technical',
        priority: 'High'
      }
    }));
    setSelectedSid(sid);
  };

  const activeCallList = Object.values(activeCalls);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-title)' }}>
            <Activity className="text-red-500 animate-pulse" /> Live Call Interception
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-2">Monitor active calls and inject manual text-to-speech responses.</p>
        </div>
        <button 
          onClick={simulateDemo}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary hover:text-black transition-all font-bold text-xs uppercase tracking-widest"
        >
          <PlayCircle size={16} /> Simulate Demo Call
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCallList.length === 0 && (
          <div className="col-span-full py-24 text-center glass-card border-dashed" style={{ color: 'var(--text-muted)' }}>
            <PhoneCall size={64} className="mx-auto mb-6 opacity-10" />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-title)' }}>Waiting for Data Stream...</h2>
            <p className="max-w-md mx-auto text-sm">No active calls detected on the network. Incoming calls will appear here in real-time for monitoring and manual override.</p>
          </div>
        )}

        {activeCallList.map(call => (
          <div 
            key={call.callSid} 
            className={`glass-card flex flex-col overflow-hidden transition-all duration-300 ${selectedSid === call.callSid ? 'ring-2 ring-primary border-primary shadow-[0_0_30px_rgba(252,225,0,0.2)]' : ''}`}
            style={{ background: 'var(--bg-surface)' }}
          >
            <div 
              className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center cursor-pointer" 
              onClick={() => setSelectedSid(call.callSid)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="font-bold text-sm" style={{ color: 'var(--text-title)' }}>{call.from}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-primary/20 rounded text-primary border border-primary/20">LIVE</span>
              </div>
            </div>
            
            <div className="p-5 flex-1">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>Real-time Feed</p>
                <div className="flex gap-2">
                  <div className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{call.category}</div>
                  <div className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-bold border border-red-500/20">{call.priority}</div>
                </div>
              </div>
              
              <div 
                className="h-48 overflow-y-auto text-xs space-y-3 p-4 rounded-xl border border-white/5 font-medium leading-relaxed"
                style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}
              >
                {call.transcript ? call.transcript.split('\n').map((line, i) => {
                  const isUser = line.trim().startsWith('User:');
                  const isAI = line.trim().startsWith('AI:');
                  return (
                    <div key={i} className={`flex gap-2 ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] p-2 rounded-lg ${isUser ? 'bg-primary/10 text-primary border border-primary/10' : 'bg-blue-500/10 text-blue-400 border border-blue-500/10'}`}>
                        <div className="flex items-center gap-1 mb-1 opacity-50">
                          {isUser ? <User size={10} /> : <Cpu size={10} />}
                          <span className="text-[8px] uppercase font-black">{isUser ? 'Customer' : 'AI Node'}</span>
                        </div>
                        {line.replace('User:', '').replace('AI:', '')}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex items-center justify-center h-full gap-2 text-slate-500 italic">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    </div>
                    Listening for signals...
                  </div>
                )}
              </div>
            </div>

            <div className={`p-4 border-t border-white/5 transition-all duration-300 ${selectedSid === call.callSid ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}`} style={{ background: 'var(--glass-bg)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase font-black tracking-widest flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <ShieldAlert size={12} className="text-primary" /> Admin Override Terminal
                </p>
                <span className="text-[8px] font-bold text-slate-500">ENCRYPTED CHANNEL</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Inject manual TTS response..." 
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-title)' }}
                  className="flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary transition-all"
                />
                <button 
                  onClick={() => handleReply(call.callSid)} 
                  disabled={!selectedSid}
                  className="bg-primary text-black px-4 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
