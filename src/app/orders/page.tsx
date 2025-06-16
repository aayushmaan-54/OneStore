"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import authClient from "@/common/lib/auth-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  totalAmount: string;
  status: "pending" | "completed" | "cancelled";
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  createdAt: Date;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: string;
}

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



export default function OrdersPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingOrderItems, setViewingOrderItems] = useState<OrderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: sessionData } = await authClient.getSession();
        setSession(sessionData);
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/login');
      }
    };

    fetchSession();
  }, [router]);


  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data: OrdersResponse = await response.json();

        if (data.success) {
          const userOrders = data.data.filter(order => order.customerEmail === session.user.email);
          setOrders(userOrders);
        } else {
          throw new Error(data.error || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session]);


  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data: OrderDetailsResponse = await response.json();

      if (data.success) {
        setViewingOrder(data.data.order);
        setViewingOrderItems(data.data.items);
      } else {
        throw new Error(data.error || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };


  const openViewDialog = async (order: Order) => {
    await fetchOrderDetails(order.id);
    setIsDialogOpen(true);
  };


  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(price));
  };


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };


  const getStatusBadge = (status: Order['status']) => {
    let variant: "default" | "secondary" | "destructive" | "outline" | null | undefined;
    switch (status) {
      case "completed":
        variant = "default";
        break;
      case "pending":
        variant = "secondary";
        break;
      case "cancelled":
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }
    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };


  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }


  if (!session) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Please login to view your orders</h3>
          <p className="mt-2 text-muted-foreground">
            You need to be logged in to see your order history.
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">Login</Link>
          </Button>
        </Card>
      </main>
    );
  }


  if (orders.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
          <p className="mt-2 text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </Card>
      </main>
    );
  }


  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">
            View and track your order history
          </p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead className="min-w-[100px]">Total</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewDialog(order)}
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Package className="h-4 w-4" />
                      <span className="sr-only">View order details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingOrder ? `Order #${viewingOrder.id.substring(0, 8)}...` : "Order Details"}
              </DialogTitle>
              <DialogDescription>
                View your order details and status
              </DialogDescription>
            </DialogHeader>

            {viewingOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Order Status</Label>
                    <div>{getStatusBadge(viewingOrder.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Date</Label>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(viewingOrder.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shipping Address</Label>
                  <Input value={viewingOrder.shippingAddress} readOnly disabled />
                </div>

                <div className="space-y-2">
                  <Label>Order Items</Label>
                  <div className="border rounded-md p-4 space-y-2">
                    {viewingOrderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.productName} (x{item.quantity})</span>
                        <span>{formatPrice(item.price)} each</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Amount</span>
                    <span>{formatPrice(viewingOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
