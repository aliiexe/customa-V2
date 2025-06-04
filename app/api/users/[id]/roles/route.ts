import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Get roles for a specific user
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Correctly handle params which may be a promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = resolvedParams.id;
    
    const sql = `
      SELECT r.*
      FROM roles r
      JOIN user_roles ur ON r.id = ur.roleId
      WHERE ur.userId = ?
    `;
    
    const roles = await query(sql, [userId]);
    return NextResponse.json(Array.isArray(roles) ? roles : []);
  } catch (error) {
    console.error(`Error fetching roles for user ${params instanceof Promise ? await params.id : params.id}:`, error);
    return NextResponse.json([], { status: 200 });  // Return empty array on error
  }
}

// Update roles for a specific user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = resolvedParams.id;
    
    const body = await request.json();
    console.log(`User ${userId} roles update request:`, body);
    
    const { roleIds } = body;
    
    if (!Array.isArray(roleIds)) {
      return NextResponse.json({ error: "Invalid role IDs format" }, { status: 400 });
    }
    
    console.log(`Updating roles for user ${userId}:`, roleIds);
    
    // Start a transaction
    await query("START TRANSACTION", []);
    
    try {
      // Delete existing role assignments
      const deleteResult = await query("DELETE FROM user_roles WHERE userId = ?", [userId]);
      console.log("Deleted existing roles:", deleteResult);
      
      // Insert new role assignments
      if (roleIds.length > 0) {
        const values = roleIds.map(roleId => [userId, roleId]);
        const placeholders = values.map(() => "(?, ?)").join(", ");
        const flatValues = values.flat();
        
        const insertResult = await query(
          `INSERT INTO user_roles (userId, roleId) VALUES ${placeholders}`,
          flatValues
        );
        console.log("Inserted new roles:", insertResult);
      }
      
      // Commit transaction
      await query("COMMIT", []);
      
      return NextResponse.json({ 
        message: "User roles updated successfully",
        roleIds: roleIds
      });
    } catch (error) {
      // Rollback transaction on error
      await query("ROLLBACK", []);
      console.error("Transaction error:", error);
      throw error;
    }
  } catch (error) {
    console.error(`Error updating roles for user:`, error);
    return NextResponse.json({ error: "Failed to update user roles" }, { status: 500 });
  }
}