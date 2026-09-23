import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShoppingBag,
  MessageCircle,
  Phone,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { Profile, Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    if (profile?.id) {
      const o = await StorageService.getOrders(profile.id);
      setOrders(o);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [profile?.id]);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    await StorageService.updateOrderStatus(orderId, newStatus);
  };

  const filteredOrders = orders.filter((o) => {
    const productName = o.product_name || o.items?.[0]?.name || 'Custom Product Inquiry';
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Orders & Inquiries</h1>
          <p className="text-xs text-zinc-500">
            Track customer requests, quote inquiries, and WhatsApp orders placed through your business page.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          {(['all', 'pending', 'confirmed', 'completed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, or product item..."
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-hidden bg-white"
        />
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900">{order.customer_name}</span>
                    <span className="text-xs text-zinc-500 font-mono">({order.customer_phone})</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600">
                    <span className="font-semibold text-zinc-800">
                      {order.product_name || order.items?.[0]?.name || 'Custom Order'}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-zinc-900">
                      ₹{(order.total_amount ?? order.total ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {order.notes && (
                    <p className="text-[11px] text-zinc-500 italic mt-1">"{order.notes}"</p>
                  )}

                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                    Received: {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  {/* Status switcher */}
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                    className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 outline-hidden"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>

                  {/* 1-click WhatsApp button */}
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.customer_name)},%20this%20is%20${encodeURIComponent(profile?.business_name || 'LinkOS')}.%20Regarding%20your%20inquiry%20for%20${encodeURIComponent(order.product_name || order.items?.[0]?.name || 'Order')}...`}
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
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">No orders match filter</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Customer inquiries submitted through your WhatsApp and catalog buttons show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
