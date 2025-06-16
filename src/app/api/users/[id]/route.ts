import { NextRequest, NextResponse } from 'next/server';
import { user, userDataTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import db from '@/common/lib/db';



export async function GET(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const result = await db
      .select({
        user,
        userData: userDataTable,
      })
      .from(user)
      .leftJoin(userDataTable, eq(user.id, userDataTable.userId))
      .where(eq(user.id, params.id));

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    const userData = {
      ...result[0].user,
      userData: result[0].userData,
    };

    return NextResponse.json({
      success: true,
      data: userData,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}



export async function PUT(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const body = await request.json();

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, params.id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        name: body.name,
        email: body.email,
        image: body.image,
        emailVerified: body.emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(user.id, params.id))
      .returning();

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    if (body.role || body.phone || body.address) {
      const existingUserData = await db
        .select()
        .from(userDataTable)
        .where(eq(userDataTable.userId, params.id))
        .limit(1);

      if (existingUserData.length > 0) {
        await db
          .update(userDataTable)
          .set({
            role: body.role,
            address: body.address,
            phone: body.phone,
          })
          .where(eq(userDataTable.userId, params.id));
      } else {
        await db
          .insert(userDataTable)
          .values({
            userId: params.id,
            role: body.role || 'user',
            address: body.address,
            phone: body.phone,
          });
      }
    }

    const [completeUser] = await db
      .select({
        user,
        userData: userDataTable,
      })
      .from(user)
      .leftJoin(userDataTable, eq(user.id, userDataTable.userId))
      .where(eq(user.id, params.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        ...completeUser.user,
        userData: completeUser.userData,
      },
      message: 'User updated successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}



export async function DELETE(
  request: NextRequest,
  context: Promise<{ params: { id: string } }>
) {
  try {
    const { params } = await context;
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, params.id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    await db
      .delete(userDataTable)
      .where(eq(userDataTable.userId, params.id));

    await db
      .delete(user)
      .where(eq(user.id, params.id));

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
