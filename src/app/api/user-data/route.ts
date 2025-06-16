import { NextRequest, NextResponse } from 'next/server';
import { userDataTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import db from '@/common/lib/db';
import checkAuth from '@/common/utils/check-auth';



export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const userData = await db
      .select()
      .from(userDataTable)
      .where(eq(userDataTable.userId, session.user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: userData[0] || null,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
