import { notFound } from "next/navigation";
import db from '@/common/lib/db';
import { product } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import ProductDetailsClient from "./_components/product-details-client";
import { Suspense } from "react";


interface ProductPageProps {
  params: Promise<{ id: string }>;
}



export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const productData = await db
    .select()
    .from(product)
    .where(eq(product.id, id))
    .then((res) => res[0]);


  if (!productData) {
    notFound();
  }

  return (
    <Suspense fallback={
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </main>
    }>
      <ProductDetailsClient initialProduct={productData} />
    </Suspense>
  );
}
