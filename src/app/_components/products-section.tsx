"use client";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/drizzle/schema";
import ProductCard from "./product-card";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductsSectionProps {
  initialProducts: Product[];
}



export default function ProductsSection({ initialProducts }: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          try {
            const nextPage = page + 1;
            const response = await fetch(`/api/products?page=${nextPage}&limit=8`);
            const data = await response.json();

            if (data.success) {
              if (data.data.length === 0) {
                setHasMore(false);
              } else {
                setProducts((prev) => [...prev, ...data.data]);
                setPage(nextPage);
              }
            }
          } catch (error) {
            console.error("Error fetching more products:", error);
          } finally {
            setIsLoading(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, isLoading]);


  return (
    <section className="container mx-auto px-4 mb-20">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          Featured Collection
        </Badge>
        <h2 className="text-4xl font-bold mb-4">
          Latest Products
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Handpicked products from trusted sellers, updated daily with the latest trends and best deals.
        </p>
      </div>

      {products.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <CardTitle className="mb-2">No Products Yet</CardTitle>
            <CardDescription>
              We&apos;re adding amazing products daily. Check back soon for incredible deals!
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div ref={observerTarget} className="h-10 mt-8">
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
