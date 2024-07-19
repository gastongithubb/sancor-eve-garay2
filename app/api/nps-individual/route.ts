import { NextResponse } from 'next/server';
import { db } from "../../../utils/db";
import { users } from '../../../utils/db';

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
  }

  try {
    const allUsers = await db.select().from(users).all();
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}