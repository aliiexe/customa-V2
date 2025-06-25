import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const excludeId = searchParams.get("excludeId");

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    let sql = "SELECT COUNT(*) as count FROM products WHERE reference = ?";
    const params: any[] = [reference];

    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }

    const result = await query(sql, params);
    const count = Array.isArray(result) && result[0] ? (result[0] as any).count : 0;

    return NextResponse.json({ available: count === 0 });
  } catch (error) {
    console.error("Error checking reference:", error);
    return NextResponse.json({ error: "Failed to check reference" }, { status: 500 });
  }
}