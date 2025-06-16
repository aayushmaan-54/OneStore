import { NextRequest, NextResponse } from 'next/server';
import { user, userDataTable } from '@/drizzle/schema';
import { desc, count, eq } from 'drizzle-orm';
import db from '@/common/lib/db';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const users = await db
      .select({
        user,
        userData: userDataTable,
      })
      .from(user)
      .leftJoin(userDataTable, eq(user.id, userDataTable.userId))
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(user);

    const total = totalResult[0]?.count || 0;

    const response = {
      success: true,
      data: users.map(u => ({
        ...u.user,
        userData: u.userData,
      })),
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Users API Error:', error);

    const errorResponse = {
      success: false,
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error',
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
    console.log('Creating user with data:', body);

    const result = await db.transaction(async (tx) => {
      const newUser = await tx
        .insert(user)
        .values({
          id: body.id || crypto.randomUUID(),
          name: body.name,
          email: body.email,
          emailVerified: body.emailVerified || false,
          image: body.image,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (body.userData) {
        await tx
          .insert(userDataTable)
          .values({
            userId: newUser[0].id,
            role: body.userData.role || 'user',
            address: body.userData.address,
            phone: body.userData.phone,
          });
      }

      return newUser[0];
    });

    const completeUser = await db
      .select({
        user,
        userData: userDataTable,
      })
      .from(user)
      .leftJoin(userDataTable, eq(user.id, userDataTable.userId))
      .where(eq(user.id, result.id))
      .then(res => ({
        ...res[0].user,
        userData: res[0].userData,
      }));

    return new NextResponse(JSON.stringify({
      success: true,
      data: completeUser,
      message: 'User created successfully',
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);

    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
