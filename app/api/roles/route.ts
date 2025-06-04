import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Use a very simple query without joins
    const sql = `SELECT * FROM roles ORDER BY roleName ASC`;
    const roles = await query(sql, []);
    
    if (!Array.isArray(roles)) {
      console.log("Roles query didn't return an array:", roles);
      return NextResponse.json([]);
    }
    
    console.log(`Found ${roles.length} roles`);
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roleName, description } = body;

    if (!roleName) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    // Check if roles table exists
    try {
      const tableCheck = await query("SHOW TABLES LIKE 'roles'", []);
      const tableExists = Array.isArray(tableCheck) && tableCheck.length > 0;
      
      // Create table if it doesn't exist
      if (!tableExists) {
        await query(`
          CREATE TABLE roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            roleName VARCHAR(50) UNIQUE NOT NULL,
            description VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `, []);
        
        // Also create the user_roles table
        await query(`
          CREATE TABLE IF NOT EXISTS user_roles (
            userId INT NOT NULL,
            roleId INT NOT NULL,
            PRIMARY KEY (userId, roleId),
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
          )
        `, []);
      }
    } catch (e) {
      console.error("Error checking/creating tables:", e);
    }

    // Check if role name already exists
    const checkSql = `SELECT COUNT(*) as count FROM roles WHERE roleName = ?`;
    const checkResult = await query(checkSql, [roleName]);
    const exists = Array.isArray(checkResult) && checkResult.length > 0 
      ? (checkResult[0] as any).count > 0
      : false;

    if (exists) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    // Insert role with description if provided
    const sql = description 
      ? `INSERT INTO roles (roleName, description) VALUES (?, ?)`
      : `INSERT INTO roles (roleName) VALUES (?)`;

    const values = description ? [roleName, description] : [roleName];
    const result = await query(sql, values);

    return NextResponse.json(
      {
        message: "Role created successfully",
        id: (result as any).insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}