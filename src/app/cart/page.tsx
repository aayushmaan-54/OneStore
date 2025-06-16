/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import CartItem from "./_components/cart-item";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import authClient from "@/common/lib/auth-client";
import Script from "next/script";
import { clearCart } from "@/common/utils/clear-cart";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    stock: number;
  };
}

interface CartData {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: string;
}



export default function CartPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  const { data: cartData, isLoading } = useQuery<CartData>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      return response.json();
    },
  });


  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: sessionData } = await authClient.getSession();
        setSession(sessionData);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setIsRazorpayLoaded(true);
      document.body.appendChild(script);
    } else if ((window as any).Razorpay) {
      setIsRazorpayLoaded(true);
    }
  }, []);


  const handleCheckout = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to continue");
      return;
    }

    if (!isRazorpayLoaded) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    try {
      const response = await fetch('/api/user-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();

      if (!data.data?.address) {
        toast.error("Please enter your shipping address in your profile before ordering");
        router.push('/profile');
        return;
      }
    } catch (error) {
      console.error('Error checking user address:', error);
      toast.error("Please enter your shipping address in your profile before ordering");
      router.push('/profile');
      return;
    }

    try {
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create order');
      }

      const data = await response.json();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "OneStore 🛍️",
        description: "Payment for your order",
        order_id: data.orderId,
        handler: async function (_response: any) {
          try {
            const updateResponse = await fetch(`/api/orders/${data.dbOrderId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'completed' }),
            });

            if (!updateResponse.ok) {
              throw new Error('Failed to update order status');
            }

            const success = await clearCart(cartData?.items || []);
            if (!success) {
              throw new Error('Failed to clear cart');
            }

            toast.success("Payment successful!");
            router.push('/orders');
          } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Payment successful but failed to update order. Please contact support.');
            router.push('/orders');
          }
        },
        modal: {
          ondismiss: async function() {
            try {
              const updateResponse = await fetch(`/api/orders/${data.dbOrderId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'cancelled' }),
              });

              if (!updateResponse.ok) {
                throw new Error('Failed to update order status');
              }

              toast.error("Payment cancelled");
            } catch (error) {
              console.error('Error updating order status:', error);
              toast.error('Failed to update order status. Please contact support.');
            }
          },
        },
        prefill: {
          name: session.user.name || "Customer Name",
          email: session.user.email || "customer@example.com",
        },
        theme: {
          color: "#582D1D",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to proceed with checkout');
    }
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


  const cartItems = cartData?.items || [];
  const totalQuantity = cartData?.totalQuantity || 0;
  const totalAmount = cartData?.totalAmount || "0";


  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsRazorpayLoaded(true)}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <span className="text-muted-foreground">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <Card className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
                <p className="mt-2 text-muted-foreground">
                  Looks like you haven&apos;t added any items to your cart yet.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item: CartItem) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    quantity={item.quantity}
                    product={item.product}
                  />
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="lg:w-80">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{(parseFloat(totalAmount) * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{(parseFloat(totalAmount) + (parseFloat(totalAmount) * 0.18)).toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
