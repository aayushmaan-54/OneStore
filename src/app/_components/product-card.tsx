"use client";
import { Product } from "@/drizzle/schema";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AddToCartButton from "./add-to-cart-button";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: Product;
}



export default function ProductCard({ product }: ProductCardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        setIsAuthenticated(data.success && data.data.isAuthenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <Card className="group relative overflow-hidden border border-border hover:border-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-auto pt-0 gap-2">
      <div className="relative h-56 overflow-hidden rounded-t-lg">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <AddToCartButton
            productId={product.id}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <div className="px-2 flex flex-col justify-between">
        <h3 className="font-bold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-primary">₹{product.price}</span>
            <span className="text-xs text-muted-foreground line-through ml-1">
              ₹{Math.round(parseFloat(product.price) * 1.2)}
            </span>
          </div>

          <div className="flex gap-3">
            <AddToCartButton
              productId={product.id}
              isAuthenticated={isAuthenticated}
              variant="default"
              size="sm"
            />
            <Button
              variant="ghost"
              asChild
            >
              <Link href={`/products/${product.id}`}>
                View
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
