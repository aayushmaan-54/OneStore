import { NextRequest, NextResponse } from "next/server";
import db from "@/common/lib/db";
import { cartItem, product as productTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import checkAuth from "@/common/utils/check-auth";



export async function POST(req: NextRequest) {
  try {
    const session = await checkAuth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { productId, quantity = 1 } = await req.json();

    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
    }

    const existingProduct = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, productId))
      .then((res) => res[0]);

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (existingProduct.stock < quantity) {
      return NextResponse.json({ message: "Not enough stock available" }, { status: 400 });
    }

    const existingCartItem = await db
      .select()
      .from(cartItem)
      .where(and(eq(cartItem.userId, userId), eq(cartItem.productId, productId)))
      .then((res) => res[0]);

    if (existingCartItem) {
      await db
        .update(cartItem)
        .set({ quantity: existingCartItem.quantity + quantity, updatedAt: new Date() })
        .where(and(eq(cartItem.userId, userId), eq(cartItem.productId, productId)));
    } else {
      await db.insert(cartItem).values({
        userId,
        productId,
        quantity,
      });
    }

    return NextResponse.json({ message: "Product added to cart successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



export async function GET() {
  try {
    const session = await checkAuth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const cartItems = await db
      .select({
        id: cartItem.id,
        quantity: cartItem.quantity,
        product: {
          id: productTable.id,
          name: productTable.name,
          description: productTable.description,
          price: productTable.price,
          image: productTable.image,
          stock: productTable.stock,
        }
      })
      .from(cartItem)
      .leftJoin(productTable, eq(cartItem.productId, productTable.id))
      .where(eq(cartItem.userId, userId));

    const validCartItems = cartItems.filter(item => item.product !== null);

    const totalQuantity = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = validCartItems.reduce((sum, item) => sum + (parseFloat(item.product!.price) * item.quantity), 0);

    return NextResponse.json({
      items: validCartItems,
      totalQuantity,
      totalAmount: totalAmount.toFixed(2)
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



export async function DELETE(req: NextRequest) {
  try {
    const session = await checkAuth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Cart item ID is required" }, { status: 400 });
    }

    await db
      .delete(cartItem)
      .where(and(eq(cartItem.id, id), eq(cartItem.userId, userId)));

    return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



export async function PATCH(req: NextRequest) {
  try {
    const session = await checkAuth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id, quantity } = await req.json();

    if (!id || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
    }

    const existingCartItem = await db
      .select()
      .from(cartItem)
      .where(and(eq(cartItem.id, id), eq(cartItem.userId, userId)))
      .then((res) => res[0]);

    if (!existingCartItem) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    const product = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, existingCartItem.productId))
      .then((res) => res[0]);

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (quantity > product.stock) {
      return NextResponse.json({ message: "Not enough stock available" }, { status: 400 });
    }

    await db
      .update(cartItem)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItem.id, id), eq(cartItem.userId, userId)));

    return NextResponse.json({ message: "Cart updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
