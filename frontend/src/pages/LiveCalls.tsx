import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { PhoneCall, Activity, MessageSquare, Send } from 'lucide-react';

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

  const activeCallList = Object.values(activeCalls);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity className="text-red-500 animate-pulse" /> Live Call Interception
        </h1>
        <p className="text-slate-400 mt-2">Monitor active calls and inject manual text-to-speech responses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCallList.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
            <PhoneCall size={48} className="mx-auto mb-4 opacity-20" />
            <p>No active calls right now. Waiting for incoming connections...</p>
          </div>
        )}

        {activeCallList.map(call => (
          <div key={call.callSid} className={`bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden ${selectedSid === call.callSid ? 'ring-2 ring-primary border-primary' : ''}`}>
            <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center cursor-pointer" onClick={() => setSelectedSid(call.callSid)}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-white font-bold text-sm">{call.from}</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 rounded text-slate-300">{call.status}</span>
            </div>
            
            <div className="p-4 flex-1">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Live Transcript</p>
              <div className="h-32 overflow-y-auto text-xs text-slate-300 space-y-2 bg-black/40 p-3 rounded-xl border border-white/5">
                {call.transcript ? call.transcript.split(/(User:|AI:)/).map((part, i) => (
                  <span key={i} className={part === 'User:' ? 'text-primary font-bold' : part === 'AI:' ? 'text-blue-400 font-bold' : ''}>
                    {part}
                  </span>
                )) : <span className="text-slate-500 italic">Listening...</span>}
              </div>
            </div>

            {selectedSid === call.callSid && (
              <div className="p-4 border-t border-white/5 bg-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
                  <MessageSquare size={12}/> Admin Override
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type response for TTS..." 
                    className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <button onClick={() => handleReply(call.callSid)} className="bg-primary text-black p-2 rounded-lg hover:bg-yellow-400 transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
