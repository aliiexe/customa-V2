import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(request);
    const email = sessionClaims?.email as string | undefined;
    if (!userId || !email) {
      // Always return 403 for not authorized (not 401)
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const sql = `
      SELECT id, firstname, lastname, username, email, phone, address, city, balance, actived, createdAt, updatedAt
      FROM users
      WHERE email = ?
      LIMIT 1
    `;
    const users = await query(sql, [email]);
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }
    return NextResponse.json(users[0]);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
} 