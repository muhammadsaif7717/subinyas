'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Package, Clock, CheckCircle2, Truck, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Order } from '@/lib/types';

export default function MyOrdersPage() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await axios.get('/api/user/orders');
      return res.data?.orders || [];
    },
  });

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <Package className="w-16 h-16 mx-auto text-slate-300 stroke-1" />
        <h2 className="text-xl font-bold text-slate-900">Please Log In to View Your Orders</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Log in with your account to view your order history, delivery tracking, and status updates.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-xs hover:bg-slate-800 transition-all"
        >
          <span>Log In to Your Account</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-xs text-slate-500 mt-1">Track the status of your purchases and deliveries</p>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-sm">Loading your orders...</div>
      ) : !orders || orders.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Package className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500">Explore our jewelry box collection and place your first order!</p>
          <Link
            href="/products/jewelry-box"
            className="inline-block mt-2 text-xs font-bold text-rose-600 hover:underline"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Order ID: </span>
                  <span className="font-mono font-bold text-slate-900">{order.orderId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      order.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : order.status === 'Confirmed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : order.status === 'Shipped'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : order.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Content */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{order.productName}</h4>
                  <p className="text-slate-600">Package: {order.comboTitle}</p>
                  <p className="text-slate-500">Colors: {order.selectedVariants?.join(', ')}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Delivery to: {order.address}</p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-base font-bold text-slate-900">৳{order.totalAmount}</div>
                  <p className="text-[11px] text-slate-400">
                    Includes ৳{order.deliveryCharge} delivery ({order.deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka'})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
