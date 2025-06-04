import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET(request: Request) {
  try {
    const sql = `
      SELECT 
        id, firstname, lastname, username, email, phone, address, city, balance, actived, createdAt, updatedAt
      FROM 
        users
      ORDER BY 
        lastname ASC, firstname ASC
    `;
    // Exclude password from result
    const users = await query(sql, []);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, email, password, firstname, lastname, phone, address, city, actived, balance = 0 } = await request.json();

    // Validate required fields
    if (!username || !email || !password || !firstname || !lastname) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if username or email already exists
    const checkSql = `SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?`;
    const checkResult = await query(checkSql, [username, email]);
    const exists = Array.isArray(checkResult) && checkResult.length > 0 
      ? (checkResult[0] as any).count > 0
      : false;

    if (exists) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (firstname, lastname, username, email, password, phone, address, city, balance, actived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      firstname, 
      lastname, 
      username, 
      email, 
      hashedPassword, 
      phone || '', 
      address || '', 
      city || '', 
      balance, 
      actived
    ]);

    return NextResponse.json(
      {
        message: "User created successfully",
        id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}