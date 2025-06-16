import { desc } from "drizzle-orm";
import { product } from "@/drizzle/schema";
import { Badge } from "@/components/ui/badge";
import db from "@/common/lib/db";
import SearchBar from "./_components/search-bar";
import ProductsSection from "./_components/products-section";



export default async function HomePage() {
  const initialProducts = await db
    .select()
    .from(product)
    .orderBy(desc(product.createdAt))
    .limit(8);

  return (
    <main className="min-h-screen">
      <section className="py-12 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-bold">
              🎉 New Products Added Daily
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground/50 bg-clip-text text-transparent leading-tight">
              Discover Amazing
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/40 bg-clip-text text-transparent leading-tight">Products</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
              Find everything you need at unbeatable prices. Quality products, trusted sellers, exceptional service.
            </p>

            <div className="max-w-lg mx-auto mb-8">
              <SearchBar />
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                ✨ Free Shipping
              </span>
              <span className="flex items-center gap-1">
                🛡️ Buyer Protection
              </span>
              <span className="flex items-center gap-1">
                ⚡ Fast Delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      <ProductsSection initialProducts={initialProducts} />
    </main>
  );
}
