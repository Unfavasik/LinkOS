import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  Plus,
  Calendar,
  X,
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { Profile, Customer } from '../../types';

export const CustomersPage: React.FC = () => {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const loadCustomers = async () => {
    if (profile?.id) {
      const c = await StorageService.getCustomers(profile.id);
      setCustomers(c);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [profile?.id]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const payload: Customer = {
      id: `cust_${Date.now()}`,
      profile_id: profile.id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      notes: newCustomer.notes,
      total_orders: 1,
      total_spent: 0,
      last_order_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await StorageService.saveCustomer(payload);
    setIsAddModalOpen(false);
    setNewCustomer({ name: '', phone: '', email: '', notes: '' });
    loadCustomers();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Customer Directory</h1>
          <p className="text-xs text-zinc-500">
            Contacts who have inquired, placed orders, or reached out via WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone number, or notes..."
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
        />
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 font-bold text-zinc-700 flex items-center justify-center text-xs shrink-0">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900">{c.name}</div>
                    <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono">{c.phone}</span>
                      {c.email && (
                        <>
                          <span>•</span>
                          <span>{c.email}</span>
                        </>
                      )}
                    </div>
                    {c.notes && (
                      <p className="text-[11px] text-zinc-500 italic mt-1">{c.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-zinc-800">
                      {c.total_orders} {c.total_orders === 1 ? 'Order' : 'Orders'}
                    </div>
                    {c.last_order_at && (
                      <div className="text-[10px] text-zinc-400">
                        Last: {new Date(c.last_order_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(c.name)},%20reaching%20out%20from%20${encodeURIComponent(profile?.business_name || 'LinkOS')}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">No contacts found</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Contacts who reach out through your page are automatically organized here.
            </p>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <h2 className="text-base font-bold text-zinc-900">Add Customer Contact</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="customer@gmail.com"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Notes (Vehicle / Product preference)
                </label>
                <textarea
                  rows={2}
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="e.g. Inquired about Scorpio N 7-seater dual tone seat covers"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
