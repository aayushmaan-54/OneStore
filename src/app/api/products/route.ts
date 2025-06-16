import { NextRequest, NextResponse } from 'next/server';
import { product } from '@/drizzle/schema';
import { desc, count } from 'drizzle-orm';
import db from '@/common/lib/db';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const products = await db
      .select()
      .from(product)
      .orderBy(desc(product.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(product);

    const total = totalResult[0]?.count || 0;

    const response = {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit)
      }
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Products API Error:', error);

    const errorResponse = {
      success: false,
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    return new NextResponse(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProduct = await db
      .insert(product)
      .values({
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        image: body.image,
        slug: body.slug,
      })
      .returning();


    return new NextResponse(JSON.stringify({
      success: true,
      data: newProduct[0],
      message: 'Product created successfully'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
