'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Search,
  Download,
  Phone,
  MessageCircle,
  Clock,
  Check,
  X,
  Eye,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Truck,
  Filter,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-[#D6A24E]/15 text-[#E4BC79] border-[#D6A24E]/30',
  Confirmed: 'bg-[#6C93C4]/15 text-[#8FB0D9] border-[#6C93C4]/30',
  Shipped: 'bg-[#9C7FC4]/15 text-[#BAA3DE] border-[#9C7FC4]/30',
  Delivered: 'bg-[#6FAE8C]/15 text-[#8FC7A9] border-[#6FAE8C]/30',
  Returned: 'bg-[#CB8A4E]/15 text-[#DDA876] border-[#CB8A4E]/30',
  Cancelled: 'bg-[#C1495A]/15 text-[#DD8A94] border-[#C1495A]/30',
};

const ALL_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Returned',
  'Cancelled',
];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const cardCls = 'bg-[#211C28] rounded-2xl border border-[#2E2733]';

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders from API
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['admin-orders', statusFilter, searchQuery],
    queryFn: async () => {
      const res = await axios.get(
        `/api/orders?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`
      );
      return res.data?.orders || [];
    },
  });

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const res = await axios.patch(`/api/orders/${orderId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders-overview'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className={`${cardCls} p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#8FB0D9]" />
            <span>Orders Management</span>
          </h2>
          <p className="text-xs text-[#8A7D97] mt-0.5">
            View, track, process, and update status for all customer orders
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/api/orders/export"
            download
            className="px-4 py-2.5 rounded-xl bg-[#2E2733] hover:bg-[#3B3242] text-[#D8CFE0] hover:text-white text-xs font-semibold border border-[#3E3447] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8FC7A9]" />
            <span>Export to Excel</span>
          </a>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-[#2E2733] hover:bg-[#3B3242] text-[#9C8FA8] hover:text-white transition-colors cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`${cardCls} p-4 sm:p-5 space-y-3.5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {['All', ...ALL_STATUSES].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#C4587A] text-white shadow-md shadow-[#C4587A]/25'
                    : 'bg-[#191520] text-[#9C8FA8] hover:text-white hover:bg-[#2A2332] border border-[#2E2733]'
                }`}
              >
                {st === 'All' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7D97]" />
            <input
              type="text"
              placeholder="Search by customer, phone, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#191520] border border-[#2E2733] focus:border-[#C4587A] text-xs text-white rounded-xl pl-9 pr-3 py-2 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={`${cardCls} overflow-hidden`}>
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C4587A]" />
            <p className="text-xs text-[#8A7D97]">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Package className="w-8 h-8 mx-auto text-[#8A7D97]" />
            <p className="text-xs text-[#8A7D97]">No orders found matching your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E2733] text-[#8A7D97] font-semibold bg-[#1C1822]">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items / Details</th>
                  <th className="py-3.5 px-4">Delivery Area</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2733]/60">
                {orders.map((order, idx) => {
                  const orderIdentifier = order.orderId || order.id || `order-${idx}`;
                  const orderTotal = order.totalAmount ?? order.total ?? 0;

                  return (
                    <tr key={orderIdentifier} className="hover:bg-[#282230]/40 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono font-bold text-white hover:text-[#E39BB4] text-left cursor-pointer"
                        >
                          #{orderIdentifier.slice(-6)}
                        </button>
                        <p className="text-[10px] text-[#8A7D97] font-mono mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('bn-BD') : ''}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{order.customerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${order.phone}`}
                            className="text-[11px] text-[#8A7D97] hover:text-white font-mono flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-[#6FAE8C]" />
                            <span>{order.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[#6FAE8C] hover:underline"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium">
                          {order.items?.length || 1} item(s)
                        </p>
                        <p className="text-[11px] text-[#8A7D97] truncate max-w-[200px]">
                          {order.items?.[0]?.productName || order.productNameBn || 'Jewelry Box'}
                        </p>
                      </td>

                      {/* Delivery Area */}
                      <td className="py-3.5 px-4">
                        <span className="text-[#D8CFE0]">
                          {order.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}
                        </span>
                        <p className="text-[10px] text-[#8A7D97] truncate max-w-[160px]">
                          {order.address}
                        </p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ৳{orderTotal}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              orderId: orderIdentifier,
                              status: e.target.value as OrderStatus,
                            })
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                            STATUS_STYLES[order.status] || STATUS_STYLES.Pending
                          } bg-[#191520]`}
                        >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-[#211C28] text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-[#2E2733] hover:bg-[#3B3242] text-[#D8CFE0] hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`${cardCls} w-full max-w-xl p-6 border border-[#2E2733] space-y-5 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b border-[#2E2733] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Order #{selectedOrder.orderId || selectedOrder.id || ''}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      STATUS_STYLES[selectedOrder.status] || STATUS_STYLES.Pending
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-xs text-[#8A7D97] mt-0.5">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('bn-BD') : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#8A7D97] hover:text-white rounded-lg hover:bg-[#2E2733] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-[#191520] p-4 rounded-xl border border-[#2E2733] space-y-2 text-xs">
              <h4 className="font-bold text-white">Customer Information</h4>
              <p className="text-[#D8CFE0]">
                Name: <span className="text-white font-semibold">{selectedOrder.customerName}</span>
              </p>
              <p className="text-[#D8CFE0]">
                Phone: <span className="text-white font-mono">{selectedOrder.phone}</span>
              </p>
              <p className="text-[#D8CFE0]">
                Address: <span className="text-white">{selectedOrder.address}</span>
              </p>
              {(selectedOrder.notes || selectedOrder.note) && (
                <p className="text-[#D8CFE0]">
                  Courier Note: <span className="text-[#E4BC79] italic">{selectedOrder.notes || selectedOrder.note}</span>
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white">Order Items ({selectedOrder.items?.length || 0})</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#191520] border border-[#2E2733]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#2A2332] shrink-0">
                        <Image
                          src={item.image || '/images/products/hello-kitty-pair.png'}
                          alt={item.productName || ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white">{item.productName}</p>
                        <p className="text-[11px] text-[#8A7D97]">
                          Variant: {item.selectedVariants?.join(', ') || item.selectedVariant?.name || 'Standard'} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-[#191520] p-4 rounded-xl border border-[#2E2733] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#8A7D97]">
                <span>Subtotal:</span>
                <span className="font-mono text-white">৳{selectedOrder.subtotal || selectedOrder.totalAmount || selectedOrder.total}</span>
              </div>
              <div className="flex justify-between text-[#8A7D97]">
                <span>Delivery Fee:</span>
                <span className="font-mono text-white">৳{selectedOrder.deliveryCharge ?? selectedOrder.deliveryFee ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#2E2733]">
                <span>Total Payable:</span>
                <span className="font-mono text-[#E39BB4]">৳{selectedOrder.totalAmount ?? selectedOrder.total}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#2E2733] hover:bg-[#3B3242] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
