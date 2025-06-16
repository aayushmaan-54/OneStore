"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CartItemProps {
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



export default function CartItem({ id, quantity, product }: CartItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();


  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > product.stock) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: newQuantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }

      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success('Quantity updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };


  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item');
      }

      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 96px"
          />
        </div>

        <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <p className="text-lg font-bold text-primary">
              ₹{parseFloat(product.price).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={isLoading || quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isLoading || quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
