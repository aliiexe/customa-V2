import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const sql = `SELECT id, roleName, createdAt FROM roles WHERE id = ?`;
    const role = await query(sql, [id]);

    if ((role as any[]).length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json((role as any[])[0]);
  } catch (error) {
    console.error(`Error fetching role ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Ensure the updatedAt column exists
    try {
      await query(`
        ALTER TABLE roles 
        ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `, []);
    } catch (e) {
      console.log("Column may already exist or table doesn't exist yet");
    }

    const id = params.id;
    const { roleName, description } = await request.json();

    const sql = `
      UPDATE roles
      SET 
        roleName = ?,
        description = ?
      WHERE id = ?
    `;

    const result = await query(sql, [roleName, description || null, id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error(`Error updating role ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Check if role is in use
    const checkSql = `SELECT COUNT(*) as count FROM user_roles WHERE roleId = ?`;
    const checkResult = await query(checkSql, [id]);
    const inUse = Array.isArray(checkResult) && checkResult.length > 0 
      ? (checkResult[0] as any).count > 0
      : false;

    if (inUse) {
      return NextResponse.json(
        { error: "Cannot delete role that is assigned to users" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM roles WHERE id = ?`;
    const result = await query(sql, [id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(`Error deleting role ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}