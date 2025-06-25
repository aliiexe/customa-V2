import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // First ensure the user_roles table exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS user_roles (
          userId INT NOT NULL,
          roleId INT NOT NULL,
          PRIMARY KEY (userId, roleId),
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
        )
      `, []);
    } catch (e) {
      console.log("user_roles table may already exist");
    }
    
    const sql = `
      SELECT COUNT(userId) as count 
      FROM user_roles 
      WHERE roleId = ?
    `;
    
    const result = await query(sql, [id]);
    const count = Array.isArray(result) && result.length > 0 ? (result[0] as any).count : 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error(`Error counting users for role ${params.id}:`, error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}