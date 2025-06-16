/* @ts-nocheck */
/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { product } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import db from '@/common/lib/db';



export async function PUT(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const body = await request.json();
    const productId = params.id;

    const updatedProduct = await db
      .update(product)
      .set({
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        image: body.image,
        slug: body.slug,
        updatedAt: new Date(),
      })
      .where(eq(product.id, productId))
      .returning();

    if (updatedProduct.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct[0],
      message: 'Product updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}



export async function DELETE(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const productId = params.id;

    const deletedProduct = await db
      .delete(product)
      .where(eq(product.id, productId))
      .returning();

    if (deletedProduct.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}



export async function GET(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, params.id))
      .then((res) => res[0]);

    if (!productData) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
