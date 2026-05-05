import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  User, CreditCard, CalendarDays, CheckCircle2, Search, 
  X, Mail, Phone, MapPin, ShieldCheck, History, Clock
} from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCustomers(res.data)).catch(console.error);
  }, []);

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── CRM Profile Modal ────────────────────────────────────── */}
      {selectedCustomer && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="glass-card w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 24 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/5 border-bottom border-white/5">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
                style={{ color: 'var(--text-title)' }}
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-yellow-600 border-4 border-surface flex items-center justify-center text-black text-3xl font-black shadow-xl" style={{ borderColor: 'var(--bg-surface)' }}>
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="px-8 pt-14 pb-8 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: 'var(--text-title)' }}>{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-muted)' }}>
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Verified Enterprise Node</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase border border-primary/20 bg-primary/10 text-primary">
                  {selectedCustomer.type} CUSTOMER
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Phone size={18} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Phone Number</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-title)' }}>{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Mail size={18} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>System Interface</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-title)' }}>{selectedCustomer.name.toLowerCase().replace(' ', '.')}@nexus.ai</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <CalendarDays size={18} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Connection Date</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-title)' }}>{format(new Date(selectedCustomer.createdAt), 'MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <MapPin size={18} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Location Node</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-title)' }}>Global Relay - Region 01</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button 
                  className="flex-1 py-3 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                  onClick={() => alert('Opening Secure Comms...')}
                >
                  Initiate Secure Call
                </button>
                <button 
                  className="px-6 py-3 rounded-xl glass-button text-xs font-black uppercase tracking-widest"
                  onClick={() => alert('Accessing Ledger...')}
                >
                  View Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-title)' }}>Customer Database</h2>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">Manage CRM records, packages, and interaction history.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-title)' }}
            className="w-full rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer: any) => (
          <div key={customer.id} className="glass-card p-6 hover:scale-[1.02] transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-yellow-600 flex items-center justify-center text-black text-lg font-bold shadow-lg">
                  {customer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-title)' }}>{customer.name}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{customer.phone}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${customer.type === 'NEW' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {customer.type}
              </span>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <CalendarDays size={16} /> Joined
                </div>
                <span style={{ color: 'var(--text-title)' }} className="font-medium">{format(new Date(customer.createdAt), 'MMM yyyy')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <CreditCard size={16} /> Last Payment
                </div>
                {customer.payments && customer.payments.length > 0 ? (
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <CheckCircle2 size={14} /> ${customer.payments[0].amount}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>None</span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
              <button 
                onClick={() => setSelectedCustomer(customer)}
                className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
              >
                View CRM Profile
              </button>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full p-12 text-center glass-card" style={{ color: 'var(--text-muted)' }}>
            No customers found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
