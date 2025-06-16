import { order, orderItem } from "@/drizzle/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import db from "@/common/lib/db";

const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "completed", "cancelled"]),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orderId = (await params).id;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Order ID is required",
      }, { status: 400 });
    }

    const foundOrder = await db.query.order.findFirst({
      where: eq(order.id, orderId),
    });

    if (!foundOrder) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
      }, { status: 404 });
    }

    const items = await db.query.orderItem.findMany({
      where: eq(orderItem.orderId, orderId),
    });

    return NextResponse.json({
      success: true,
      data: { order: foundOrder, items },
      message: "Order details fetched successfully",
    }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching order:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order details",
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orderId = (await params).id;
    const body = await request.json();

    const validation = updateOrderStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid request body",
        details: validation.error.formErrors.fieldErrors,
      }, { status: 400 });
    }

    const { status } = validation.data;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: "Order ID is required",
      }, { status: 400 });
    }

    const updatedOrders = await db
      .update(order)
      .set({ status, updatedAt: new Date() })
      .where(eq(order.id, orderId))
      .returning();

    if (updatedOrders.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Order not found or no changes made",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedOrders[0],
      message: "Order status updated successfully",
    }, { status: 200 });
  } catch (error) {
    console.error(`Error updating order:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status",
    }, { status: 500 });
  }
}
