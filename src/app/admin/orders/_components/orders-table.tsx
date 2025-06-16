"use client";
import { Order } from "@/drizzle/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Package } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
}



export default function OrdersTable({ orders, onViewDetails }: OrdersTableProps) {
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


  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No orders found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no orders to display.
        </p>
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order ID</TableHead>
            <TableHead className="min-w-[150px]">Customer</TableHead>
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
              <TableCell>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
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
                  onClick={() => onViewDetails(order)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View order details</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
