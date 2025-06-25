import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const supplier = searchParams.get("supplier");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "ASC";

    let sql = `
      SELECT 
        p.*,
        s.name as supplierName,
        c.name as categoryName
      FROM 
        products p
      LEFT JOIN 
        suppliers s ON p.supplierId = s.id
      LEFT JOIN 
        product_categories c ON p.categoryId = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      sql += " AND (p.name LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category && category !== "all") {
      sql += " AND p.categoryId = ?";
      params.push(category);
    }

    if (supplier && supplier !== "all") {
      sql += " AND p.supplierId = ?";
      params.push(supplier);
    }

    // Add sorting
    const validSortColumns = ["name", "reference", "stockQuantity", "sellingPrice", "supplierPrice"];
    const validSortOrders = ["ASC", "DESC"];
    
    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      sql += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      sql += " ORDER BY p.name ASC";
    }

    const products = await query(sql, params);

    // Format the results
    const formattedProducts = Array.isArray(products)
      ? products.map((product: any) => ({
          ...product,
          supplierPrice: Number(product.supplierPrice || 0),
          sellingPrice: Number(product.sellingPrice || 0),
          stockQuantity: Number(product.stockQuantity || 0),
          provisionalStock: Number(product.provisionalStock || 0),
        }))
      : [];

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      reference,
      supplierPrice,
      sellingPrice,
      stockQuantity,
      provisionalStock,
      description,
      supplierId,
      categoryId,
    } = body;

    if (!name || !reference || !supplierId || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if product with same reference already exists
    const existingProduct = await query(
      "SELECT id FROM products WHERE reference = ?",
      [reference]
    );

    if (Array.isArray(existingProduct) && existingProduct.length > 0) {
      return NextResponse.json({ error: "Product with this reference already exists" }, { status: 409 });
    }

    const result = await query(
      `INSERT INTO products (
        name, reference, supplierPrice, sellingPrice, stockQuantity, 
        provisionalStock, description, supplierId, categoryId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        reference,
        Number(supplierPrice) || 0,
        Number(sellingPrice) || 0,
        Number(stockQuantity) || 0,
        Number(provisionalStock) || 0,
        description || null,
        supplierId,
        categoryId,
      ]
    );

    return NextResponse.json(
      { message: "Product created successfully", id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
