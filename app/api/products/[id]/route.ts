import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Get a single product with details
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    const productQuery = `
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
      WHERE p.id = ?
    `;

    const productResult = await query(productQuery, [productId]);

    if (!Array.isArray(productResult) || productResult.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productResult[0] as any;

    // Format the product data
    const formattedProduct = {
      ...product,
      supplierPrice: Number(product.supplierPrice || 0),
      sellingPrice: Number(product.sellingPrice || 0),
      stockQuantity: Number(product.stockQuantity || 0),
      provisionalStock: Number(product.provisionalStock || 0),
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// Update a product
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
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

    // Check if another product has the same reference
    const existingProduct = await query(
      "SELECT id FROM products WHERE reference = ? AND id != ?",
      [reference, id]
    );

    if (Array.isArray(existingProduct) && existingProduct.length > 0) {
      return NextResponse.json({ error: "Another product with this reference already exists" }, { status: 409 });
    }

    const sql = `
      UPDATE products
      SET 
        name = ?,
        reference = ?,
        supplierPrice = ?,
        sellingPrice = ?,
        stockQuantity = ?,
        provisionalStock = ?,
        description = ?,
        supplierId = ?,
        categoryId = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const queryParams = [
      name,
      reference,
      Number(supplierPrice) || 0,
      Number(sellingPrice) || 0,
      Number(stockQuantity) || 0,
      Number(provisionalStock) || 0,
      description || null,
      supplierId,
      categoryId,
      id
    ];

    const result = await query(sql, queryParams);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(`Error updating product ${params.id}:`, error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// Delete a product
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    // Check if product is used in any quotes
    const quotesCheck = await query(
      "SELECT COUNT(*) as count FROM client_quote_items WHERE productId = ?",
      [productId]
    );

    const hasQuotes = Array.isArray(quotesCheck) && quotesCheck.length > 0 
      ? (quotesCheck[0] as any).count > 0
      : false;

    if (hasQuotes) {
      return NextResponse.json(
        { error: "Cannot delete product that is referenced in quotes" },
        { status: 400 }
      );
    }

    // Check if product is used in any invoices
    const invoicesCheck = await query(
      "SELECT COUNT(*) as count FROM client_invoice_items WHERE productId = ?",
      [productId]
    );

    const hasInvoices = Array.isArray(invoicesCheck) && invoicesCheck.length > 0 
      ? (invoicesCheck[0] as any).count > 0
      : false;

    if (hasInvoices) {
      return NextResponse.json(
        { error: "Cannot delete product that is referenced in invoices" },
        { status: 400 }
      );
    }

    const result = await query("DELETE FROM products WHERE id = ?", [productId]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
