import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "ASC";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push("(p.name LIKE ? OR p.reference LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      whereConditions.push("pc.name = ?");
      queryParams.push(category);
    }

    if (status) {
      if (status === "out-of-stock") {
        whereConditions.push("p.stockQuantity = 0");
      } else if (status === "low-stock") {
        whereConditions.push("p.stockQuantity <= 10 AND p.stockQuantity > 0");
      } else if (status === "in-stock") {
        whereConditions.push("p.stockQuantity > 10");
      }
    }

    const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

    // Use hardcoded reorder level of 10
    const inventoryQuery = `
      SELECT 
        p.id,
        p.name,
        p.reference,
        pc.name as category,
        s.name as supplier,
        p.stockQuantity as inStock,
        10 as reorderLevel,
        CASE
          WHEN p.stockQuantity = 0 THEN 'out-of-stock'
          WHEN p.stockQuantity <= 10 THEN 'low-stock'
          ELSE 'in-stock'
        END as status,
        p.sellingPrice,
        (p.sellingPrice * p.stockQuantity) as totalValue
      FROM products p
      LEFT JOIN product_categories pc ON p.categoryId = pc.id
      LEFT JOIN suppliers s ON p.supplierId = s.id
      ${whereClause}
      ORDER BY 
        CASE
          WHEN p.stockQuantity = 0 THEN 1
          WHEN p.stockQuantity <= 10 THEN 2
          ELSE 3
        END,
        p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const result = await query(inventoryQuery, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN product_categories pc ON p.categoryId = pc.id
      LEFT JOIN suppliers s ON p.supplierId = s.id
      ${whereClause}
    `;
    
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const countResult = await query(countQuery, countParams);
    const total = Array.isArray(countResult) && countResult[0] ? countResult[0].total : 0;

    if (!Array.isArray(result)) {
      return NextResponse.json({ products: [], total: 0, page, limit });
    }

    const formattedData = result.map((item: any) => ({
      id: item.id,
      name: item.name,
      reference: item.reference,
      category: item.category || 'Uncategorized',
      supplier: item.supplier || 'No Supplier',
      inStock: Number(item.inStock),
      reorderLevel: Number(item.reorderLevel),
      status: item.status,
      sellingPrice: Number(item.sellingPrice),
      totalValue: Number(item.totalValue)
    }));

    return NextResponse.json({
      products: formattedData,
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("Error fetching product inventory data:", error);
    return NextResponse.json({ error: "Failed to fetch inventory data" }, { status: 500 });
  }
}