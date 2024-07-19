import { NextResponse } from 'next/server';
import { db, getNPSTrimestral, updateNPSTrimestral } from "@/utils/db";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  if (!db) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
  }

  try {
    const userId = parseInt(params.userId, 10);
    const npsTrimestral = await getNPSTrimestral(userId);
    return NextResponse.json(npsTrimestral);
  } catch (error) {
    console.error('Error fetching NPS trimestral:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  if (!db) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
  }

  try {
    const userId = parseInt(params.userId, 10);
    const { month, nps } = await request.json();
    await updateNPSTrimestral(userId, month, nps);
    return NextResponse.json({ message: "NPS trimestral updated successfully" });
  } catch (error) {
    console.error('Error updating NPS trimestral:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}