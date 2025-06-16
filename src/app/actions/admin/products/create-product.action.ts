/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import db from "@/common/lib/db";
import { ServerActionType } from "@/common/types/api";
import { product, Product } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";



export async function createProductAction(
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<ServerActionType> {
  try {
    if (!productData.name?.trim()) {
      return {
        status: "error",
        error: "Product name is required"
      };
    }

    if (!productData.price || productData.price === "" || isNaN(parseFloat(productData.price))) {
      return {
        status: "error",
        error: "Valid price is required"
      };
    }

    if (!productData.slug?.trim()) {
      return {
        status: "error",
        error: "Product slug is required"
      };
    }

    if (!productData.description?.trim()) {
      return {
        status: "error",
        error: "Product description is required"
      };
    }


    const existingProduct = await db.query.product.findFirst({
      where: (products, { eq }) => eq(products.slug, productData.slug.trim())
    });

    if (existingProduct) {
      return {
        status: "error",
        error: "A product with this slug already exists"
      };
    }

    const [newProduct] = await db.insert(product).values({
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: productData.price,
      stock: productData.stock || 0,
      image: productData.image,
      slug: productData.slug.trim(),
    }).returning();

    if (!newProduct) {
      return {
        status: "error",
        error: "Failed to create product: No data returned after insertion"
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/products");

    return {
      status: "success",
      message: "Product created successfully!",
      data: newProduct
    };
  } catch (error: any) {
    if (error.code === '23505') {
      return {
        status: "error",
        error: "A product with this slug already exists"
      };
    }

    return {
      status: "error",
      error: error.message || "Failed to create product due to an unexpected error"
    };
  }
}
