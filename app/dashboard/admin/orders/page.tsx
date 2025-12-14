'use client';

import { useEffect, useState } from "react";
import { get } from "@/utils/http";

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    sweet: {
        name: string;
        price: number;
    };
}

interface Order {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    items: OrderItem[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await get<{ orders: Order[] }>(
                    "/api/admin/orders",
                    token
                );
                setOrders(res.orders);
            } catch (err) {
                console.error("Failed to load orders", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <p className="p-6">Loading orders...</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Current Orders</h1>

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl shadow p-4"
                        >
                            <div className="flex justify-between mb-2">
                                <div>
                                    <p className="font-semibold">
                                        Order #{order.id}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.user.name} ({order.user.email})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">
                                        ₹{order.total}
                                    </p>
                                    <p className="text-sm">
                                        Status: {order.status}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-2">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between text-sm py-1"
                                    >
                                        <span>
                                            {item.sweet.name} × {item.quantity}
                                        </span>
                                        <span>₹{item.price}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
