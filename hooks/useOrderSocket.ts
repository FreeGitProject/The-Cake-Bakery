'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

interface OrderEvent {
  type: 'NEW_ORDER' | 'STATUS_UPDATE';
  orderId?: string;
  order?: any;
  status?: string;
  timestamp: string;
}

export function useOrderSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();
  const onlineAdminsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000');
    socketRef.current = socket;

    socket.emit('join-order-room', { 
      userId, 
      role: session?.user?.role === 'admin' ? 'admin' : 'user' 
    });

    socket.on('order-update', (data: OrderEvent) => {
      window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data }));
    });

    socket.on('online-status', ({ onlineAdmins }) => {
      onlineAdminsRef.current = onlineAdmins;
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, session?.user?.role]);

  const sendOrder = useCallback((order: any) => {
    socketRef.current?.emit('new-order', order);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: string) => {
    socketRef.current?.emit('update-order-status', { orderId, status, userId });
  }, []);

  return {
    socket: socketRef.current,
    onlineAdmins: onlineAdminsRef.current,
    sendOrder,
    updateOrderStatus,
  };
}
