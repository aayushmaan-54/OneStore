/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/app/_components/add-to-cart-button";
import authClient from "@/common/lib/auth-client";
import { clearCart } from "@/common/utils/clear-cart";

interface ProductDetailsProps {
  initialProduct: {
    id: string;
    name: string;
    description: string;
    price: string;
    stock: number;
    image: string;
  };
}


export default function ProductDetailsClient({ initialProduct }: ProductDetailsProps) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [product] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);


  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await authClient.getSession();
      setSession(sessionData);
    };
    getSession();
  }, []);


  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };


  const handleBuyNow = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to continue");
      router.push('/login');
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
      const addToCartResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!addToCartResponse.ok) {
        throw new Error('Failed to add to cart');
      }

      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const checkoutResponse = await fetch('/api/razorpay', {
        method: 'POST',
      });

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const data = await checkoutResponse.json();

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

            // Get cart items before clearing
            const cartResponse = await fetch('/api/cart');
            if (!cartResponse.ok) {
              throw new Error('Failed to fetch cart');
            }
            const cartData = await cartResponse.json();

            const success = await clearCart(cartData.items || []);
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
          ondismiss: async function () {
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
          name: session?.user?.name || "Customer Name",
          email: session?.user?.email || "customer@example.com",
        },
        theme: {
          color: "#582D1D",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to proceed with checkout');
    }
  };


  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">₹{product.price}</span>
              </div>

              <p className="text-muted-foreground">{product.description}</p>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Details</h3>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Stock</p>
                    <p>{product.stock} units available</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex items-center border rounded-lg w-32">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xl h-10 w-10"
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="flex-1 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xl h-10 w-10"
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                  <AddToCartButton
                    productId={product.id}
                    isAuthenticated={!!session}
                    variant="default"
                    size="default"
                    showText={true}
                    quantity={quantity}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full h-10 mt-4"
                  disabled={product.stock === 0}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">
                {product.description ||
                  "No additional description available."}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Shipping & Returns</h4>
              <p className="text-muted-foreground">
                Free shipping on all orders. 30-day return policy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
