import { auth } from "@/common/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/common/lib/db";
import { order, orderItem, cartItem, product } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";



export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const cartItems = await db
      .select({
        quantity: cartItem.quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
        }
      })
      .from(cartItem)
      .leftJoin(product, eq(cartItem.productId, product.id))
      .where(eq(cartItem.userId, session.user.id));

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    const totalAmount = cartItems.reduce((sum, item) =>
      sum + (parseFloat(item.product!.price) * item.quantity), 0
    );

    const [dbOrder] = await db
      .insert(order)
      .values({
        userId: session.user.id,
        totalAmount: totalAmount.toString(),
        status: "pending",
        customerName: session.user.name || "Customer",
        customerEmail: session.user.email || "customer@example.com",
        shippingAddress: "Mock Address", 
      })
      .returning();

    await db.insert(orderItem).values(
      cartItems.map(item => ({
        orderId: dbOrder.id,
        productId: item.product!.id,
        productName: item.product!.name,
        quantity: item.quantity,
        price: item.product!.price,
      }))
    );

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: dbOrder.id.toString(),
    });

    return NextResponse.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: dbOrder.id,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
