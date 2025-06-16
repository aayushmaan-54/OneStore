/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/common/hooks/use-cart";

interface AddToCartButtonProps {
  productId: string;
  isAuthenticated: boolean;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg" | "icon";
  showText?: boolean;
  quantity?: number;
}



export default function AddToCartButton({
  productId,
  isAuthenticated,
  variant = "secondary",
  size = "icon",
  showText = false,
  quantity = 1
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();


  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsLoading(true);

    try {
      await addToCart(productId, quantity);
    } catch (error) {
      // Error is already handled in the useCart hook
    } finally {
      setIsLoading(false);
    }
  };


  if (size === "icon") {
    return (
      <Button
        size="icon"
        variant={variant}
        onClick={handleAddToCart}
        disabled={isLoading}
        className="size-8 bg-background/80 backdrop-blur-sm hover:bg-background"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    );
  }


  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleAddToCart}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {showText ? (isLoading ? "Adding..." : "Add to Cart") : "Add"}
    </Button>
  );
}
