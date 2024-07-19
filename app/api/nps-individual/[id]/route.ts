import { NextResponse } from 'next/server';
import { db } from "@/utils/db";
import { users } from '@/utils/db';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!db) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
  }

  try {
    const id = parseInt(params.id, 10);
    const user = await db.select().from(users).where(eq(users.id, id)).get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!db) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
  }

  try {
    const id = parseInt(params.id, 10);
    const { responses, nps, csat, rd } = await request.json();

    await db.update(users)
      .set({ responses, nps, csat, rd })
      .where(eq(users.id, id))
      .run();

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}