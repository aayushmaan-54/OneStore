"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, OrderItem, orderStatusEnum } from "@/drizzle/schema";
import { useEffect, useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  onSubmit: (orderId: string, status: typeof orderStatusEnum.enumValues[number]) => void;
  isLoading?: boolean;
  orderItems: OrderItem[];
}



export default function OrderDialog({
  open,
  onOpenChange,
  order,
  onSubmit,
  isLoading = false,
  orderItems,
}: OrderDialogProps) {
  const [currentStatus, setCurrentStatus] = useState<typeof orderStatusEnum.enumValues[number]>(
    order?.status || "pending"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    } else {
      setCurrentStatus("pending");
    }
  }, [order, open]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmitting(true);
    try {
      await onSubmit(order.id, currentStatus);
    } catch (error) {
      console.error("Order update error:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsSubmitting(false);
    }
  };


  const isDisabled = isSubmitting || isLoading;


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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? `Order #${order.id.substring(0, 8)}...` : "Order Details"}</DialogTitle>
          <DialogDescription>
            {order ? "View and update the order details." : "Order information."}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" value={order.customerName} readOnly disabled={true} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input id="customerEmail" value={order.customerEmail} readOnly disabled={true} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Input id="shippingAddress" value={order.shippingAddress} readOnly disabled={true} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input id="totalAmount" value={formatPrice(order.totalAmount)} readOnly disabled={true} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createdAt">Order Date</Label>
                <Input id="createdAt" value={formatDate(order.createdAt)} readOnly disabled={true} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={currentStatus}
                onValueChange={(value: typeof orderStatusEnum.enumValues[number]) => setCurrentStatus(value)}
                disabled={isDisabled}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatusEnum.enumValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-lg">Order Items</h4>
              {orderItems.length > 0 ? (
                <ul className="space-y-2 border rounded-md p-3">
                  {orderItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-sm">
                      <span>{item.productName} (x{item.quantity})</span>
                      <span>{formatPrice(item.price)} each</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No items found for this order.</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isDisabled}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
