import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { User, CreditCard, CalendarDays, CheckCircle2, Search } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/users').then(res => setCustomers(res.data)).catch(console.error);
  }, []);

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Database</h2>
          <p className="text-slate-400 text-sm">Manage CRM records, packages, and interaction history.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer: any) => (
          <div key={customer.id} className="bg-panel border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/20">
                  {customer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{customer.name}</h3>
                  <p className="text-sm text-slate-400">{customer.phone}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${customer.type === 'NEW' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {customer.type}
              </span>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <CalendarDays size={16} /> Joined
                </div>
                <span className="text-slate-300 font-medium">{format(new Date(customer.createdAt), 'MMM yyyy')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard size={16} /> Last Payment
                </div>
                {customer.payments && customer.payments.length > 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={14} /> ${customer.payments[0].amount}
                  </span>
                ) : (
                  <span className="text-slate-500">None</span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-dark text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                View CRM Profile
              </button>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-panel rounded-2xl border border-slate-800">
            No customers found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
