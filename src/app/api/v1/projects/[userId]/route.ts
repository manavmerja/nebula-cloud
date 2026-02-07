import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// URL se User ID (Email) lekar projects dhundho
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. Get User ID from URL
    const { userId } = await params;
    
    // Decode email (agar URL encoded ho toh safe side ke liye)
    const email = decodeURIComponent(userId);
    console.log(`[API_V1] Fetching projects for: ${email}`);

    // 2. Connect DB
    const client = await clientPromise;
    const db = client.db();

    // 3. Find Projects for this User
    // Note: Hum check kar rahe hain ki 'userId' field me email match ho
    const projects = await db.collection("projects")
      .find({ userId: email }) 
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(projects); // Seedha array bhejo (Legacy format)

  } catch (error) {
    console.error("[API_V1] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}