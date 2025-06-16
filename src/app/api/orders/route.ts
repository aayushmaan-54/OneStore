/* eslint-disable @typescript-eslint/no-explicit-any */
import db from "@/common/lib/db";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const allOrders = await db.query.order.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: allOrders,
      message: "Orders fetched successfully",
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to fetch orders",
    }, { status: 500 });
  }
}
