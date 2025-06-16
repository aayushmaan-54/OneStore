import { auth } from "@/common/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: !!session,
        user: session?.user || null
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Authentication check failed"
    }, { status: 401 });
  }
}
