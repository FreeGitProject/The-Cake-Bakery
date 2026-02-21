"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Calendar, Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Loader from './Loader';

interface OrderItem {
  productId: string;
  name: string;
  caketype: string;
  quantity: number;
  weight: number;
  price: number;
  image: string;
}
interface AddOnItem {
  addonId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  orderItems: OrderItem[];
  addonItems: AddOnItem[];
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  orderNumber: string;
  createdAt: string;
  couponCode?: string;
  discountAmount?: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'shipped':
        return 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-3.5 h-3.5 mr-1.5" />;
      case 'shipped':
        return <Package className="w-3.5 h-3.5 mr-1.5" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5 mr-1.5" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5 mr-1.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase ${getStatusStyle()} transition-all duration-300`}>
      {getStatusIcon()}
      {status}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getPaymentStatusInfo = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          icon: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 'pending':
        return {
          color: 'bg-gradient-to-r from-amber-400 to-orange-400',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
        };
      case 'failed':
        return {
          color: 'bg-gradient-to-r from-rose-500 to-pink-500',
          icon: <XCircle className="w-3.5 h-3.5 mr-1.5" />,
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-400 to-gray-500',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
        };
    }
  };

  const { color, icon } = getPaymentStatusInfo();

  return (
    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white ${color} shadow-soft transition-all duration-300`}>
      {icon}
      {status}
    </span>
  );
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { data: session } = useSession();
  const [isLoading,setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${session?.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setIsLoading(true);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };


  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-brand-pink" />
        </div>
        <h3 className="text-xl font-display font-semibold text-brand-text">Please log in</h3>
        <p className="text-brand-text-secondary mt-2 text-center max-w-sm">Sign in to view your orders and track deliveries</p>
      </div>
    );
  }
  if(!isLoading)
  {
    return <Loader/>;
  }
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-brand-pink" />
        </div>
        <h3 className="text-xl font-display font-semibold text-brand-text">No orders yet</h3>
        <p className="text-brand-text-secondary mt-2 text-center max-w-sm">When you place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-brand-text">
          My Orders
        </h2>
        <p className="text-brand-text-secondary mt-2">Track and manage your cake orders</p>
        <div className="h-1 w-16 bg-gradient-to-r from-brand-pink to-brand-pink-light rounded-full mt-4" />
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {orders.map((order, orderIndex) => (
          <div
            key={order._id}
            className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100/80"
            style={{ animationDelay: `${orderIndex * 100}ms` }}
          >
            {/* Order Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-brand-cream/60 to-white border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-display font-bold text-brand-text">
                    Order #{order.orderNumber ?? order.orderId}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-text-secondary">
                    <span className="inline-flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-pink" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center">
                      <CreditCard className="w-3.5 h-3.5 mr-1.5 text-brand-pink" />
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-5">
              <div className="space-y-3">
                {order.orderItems.map((item, index) => (
                  <div key={index}
                       className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-cream/40 transition-all duration-300 group/item">
                    <Link href={`/cakes/${item.productId}`} className="flex-shrink-0">
                      <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden shadow-soft ring-1 ring-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    <div className="flex-grow min-w-0">
                      <Link href={`/cakes/${item.productId}`}>
                        <h4 className="font-semibold text-brand-text group-hover/item:text-brand-pink transition-colors duration-300 truncate">
                          {item.name}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 text-sm text-brand-text-secondary">
                        <span>{item.caketype === "cake" ? `${item.weight}kg` : `${item.weight} pcs`}</span>
                        <span className="text-gray-300">|</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-brand-text">{'\u20B9'}{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-brand-text-secondary">{'\u20B9'}{item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}

                {order.addonItems.map((item, index) => (
                  <div key={index}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-cream/40 transition-all duration-300 group/item">
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden shadow-soft ring-1 ring-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-brand-text truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-brand-text-secondary mt-0.5">Qty: {item.quantity}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-brand-text">{'\u20B9'}{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-brand-text-secondary">{'\u20B9'}{item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer / Summary */}
              <div className="mt-5 pt-5 border-t border-dashed border-gray-200 space-y-3">
                {order.couponCode && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="inline-flex items-center gap-1.5 text-emerald-600">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono font-semibold">
                        {order.couponCode}
                      </span>
                      <span className="text-emerald-500">applied</span>
                    </span>
                    <span className="font-medium text-emerald-600">-{'\u20B9'}{order.discountAmount?.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-text-secondary">Total Amount</span>
                  <span className="text-2xl font-display font-bold text-brand-text">
                    {'\u20B9'}{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center text-sm text-brand-text-secondary">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-pink" />
                    <span>{order.orderStatus}</span>
                  </div>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
