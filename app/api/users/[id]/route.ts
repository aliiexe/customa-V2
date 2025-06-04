import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

// Get a single user
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const sql = `
      SELECT id, firstname, lastname, username, email, phone, address, city, balance, actived, createdAt, updatedAt
      FROM users 
      WHERE id = ?
    `;
    const user = await query(sql, [id]);

    if ((user as any[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json((user as any[])[0]);
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// Update a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const userData = await request.json();
    
    // Prepare update fields and values
    const fields: string[] = [];
    const values: any[] = [];
    
    // Destructure userData to get all potential fields
    const { 
      firstname, lastname, username, email, 
      password, phone, address, city, 
      actived, balance 
    } = userData;
    
    // Check for username/email conflicts if they're being updated
    if (username || email) {
      const checkSql = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE (username = ? OR email = ?) AND id != ?
      `;
      const checkResult = await query(checkSql, [username || '', email || '', id]);
      const exists = Array.isArray(checkResult) && checkResult[0] && (checkResult[0] as any).count > 0;
      
      if (exists) {
        return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
      }
    }
    
    // Add each field that's present in the request
    if (firstname !== undefined) {
      fields.push('firstname = ?');
      values.push(firstname);
    }
    
    if (lastname !== undefined) {
      fields.push('lastname = ?');
      values.push(lastname);
    }

    if (username !== undefined) {
      fields.push('username = ?');
      values.push(username);
    }

    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone);
    }

    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address);
    }

    if (city !== undefined) {
      fields.push('city = ?');
      values.push(city);
    }

    // Convert actived to a proper boolean/integer value
    if (actived !== undefined) {
      fields.push('actived = ?');
      values.push(actived ? 1 : 0);
    }

    if (balance !== undefined) {
      fields.push('balance = ?');
      values.push(balance);
    }
    
    // Always update the updatedAt timestamp
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    
    if (fields.length === 1) {
      // Only updatedAt is set, nothing to update
      return NextResponse.json({ message: "No fields to update" });
    }

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    values.push(id); // Add ID for WHERE clause
    console.log("Update SQL:", sql, values);
    
    const result = await query(sql, values);
    
    // Check if user was found and updated
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "User updated successfully",
      id: id
    });
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// Delete a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Delete the user
    const deleteQuery = `DELETE FROM users WHERE id = ?`;
    const result = await query(deleteQuery, [id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}