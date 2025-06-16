import { product } from "@/drizzle/schema";
import { ilike, or } from "drizzle-orm";
import db from "@/common/lib/db";
import ProductCard from "../_components/product-card";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface SearchPageProps {
  searchParams: { q?: string };
}



export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";

  const products = query
    ? await db
        .select()
        .from(product)
        .where(
          or(
            ilike(product.name, `%${query}%`),
            ilike(product.description, `%${query}%`)
          )
        )
    : [];


  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? `Search Results for "${query}"` : "Search Products"}
        </h1>
        <p className="text-muted-foreground">
          {products.length} {products.length === 1 ? "result" : "results"} found
        </p>
      </div>

      {products.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <CardTitle className="mb-2">No Results Found</CardTitle>
            <CardDescription>
              {query
                ? `We couldn't find any products matching "${query}". Try different keywords or browse our categories.`
                : "Enter a search term to find products."}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
