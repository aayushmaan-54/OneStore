/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Order, OrderItem, orderStatusEnum } from "@/drizzle/schema";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import OrderDialog from "./order-dialog";
import OrdersTable from "./orders-table";
import OrdersSkeleton from "./orders-skeleton";

interface OrdersResponse {
  success: boolean;
  data: Order[];
  error?: string;
}

interface OrderDetailsResponse {
  success: boolean;
  data: {
    order: Order;
    items: OrderItem[];
  };
  error?: string;
}



export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingOrderItems, setViewingOrderItems] = useState<OrderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);


  const fetchOrders = async () => {
    setIsFetching(true);
    try {
      console.log('Fetching orders from API...');
      const response = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON, got:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.data);
        console.log('Orders loaded successfully:', data.data.length);
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setIsFetching(false);
    }
  };


  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OrderDetailsResponse = await response.json();

      if (data.success) {
        setViewingOrder(data.data.order);
        setViewingOrderItems(data.data.items);
      } else {
        throw new Error(data.error || 'Failed to fetch order details');
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error(error.message || 'Failed to fetch order details');
      setViewingOrder(null);
      setViewingOrderItems([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, []);


  const openViewDialog = async (order: Order) => {
    await fetchOrderDetails(order.id);
    setIsDialogOpen(true);
  };


  const handleUpdateOrderStatus = async (orderId: string, status: typeof orderStatusEnum.enumValues[number]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Order status updated successfully!');
        setIsDialogOpen(false);
        setViewingOrder(null);
        setViewingOrderItems([]);
        await fetchOrders();
      } else {
        throw new Error(result.error || "Failed to update order status");
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Failed to update order status.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleRefresh = () => {
    fetchOrders();
  };


  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">Order Management</h3>
            <p className="text-sm text-muted-foreground">
              View and manage customer orders.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total Orders: {orders.length}</span>
          <span>•</span>
          <span>Pending: {orders.filter(o => o.status === 'pending').length}</span>
          <span>•</span>
          <span>Completed: {orders.filter(o => o.status === 'completed').length}</span>
          <span>•</span>
          <span>Cancelled: {orders.filter(o => o.status === 'cancelled').length}</span>
        </div>

        <div className="border rounded-lg">
          {isFetching ? (
            <OrdersSkeleton />
          ) : (
            <OrdersTable
              orders={orders}
              onViewDetails={openViewDialog}
            />
          )}
        </div>

        <OrderDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setViewingOrder(null);
              setViewingOrderItems([]);
            }
          }}
          order={viewingOrder}
          orderItems={viewingOrderItems}
          onSubmit={handleUpdateOrderStatus}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
