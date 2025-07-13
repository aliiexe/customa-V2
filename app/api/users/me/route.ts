import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(request);
    console.log("sessionClaims", sessionClaims);
    // Try to extract email from sessionClaims
    let email;
    if (sessionClaims?.email) {
      email = sessionClaims.email;
    } else if (
      Array.isArray(sessionClaims?.email_addresses) &&
      sessionClaims.email_addresses.length > 0
    ) {
      email = sessionClaims.email_addresses[0]?.email_address;
    }
    console.log("email", email);
    if (!userId || !email) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    const sql = `
      SELECT id, firstname, lastname, username, email, phone, address, city, balance, actived, createdAt, updatedAt
      FROM users
      WHERE email = ?
      LIMIT 1
    `;
    const users = await query(sql, [normalizedEmail]);
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }
    return NextResponse.json(users[0]);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
} 