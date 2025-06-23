import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let sql = `
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as productCount,
        COUNT(DISTINCT si.id) as invoiceCount,
        SUM(CASE WHEN si.payment_status = 'UNPAID' THEN si.totalAmount ELSE 0 END) as unpaidAmount
      FROM 
        suppliers s
      LEFT JOIN 
        products p ON s.id = p.supplierId
      LEFT JOIN 
        supplier_invoices si ON s.id = si.supplierId
      WHERE 1=1
    `

    const params: any[] = []

    if (search) {
      sql += " AND (s.name LIKE ? OR s.contactName LIKE ? OR s.email LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    sql +=
      " GROUP BY s.id, s.name, s.contactName, s.address, s.email, s.phoneNumber, s.website, s.createdAt, s.updatedAt"
    sql += " ORDER BY s.name ASC"

    const suppliers = await query(sql, params)

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supplier = await request.json()

    const sql = `
      INSERT INTO suppliers (
        name, contactName, address, email, phoneNumber, website
      ) VALUES (?, ?, ?, ?, ?, ?)
    `

    const params = [
      supplier.name,
      supplier.contactName,
      supplier.address,
      supplier.email,
      supplier.phoneNumber,
      supplier.website,
    ]

    const result = await query(sql, params)

    return NextResponse.json(
      {
        message: "Supplier created successfully",
        id: (result as any).insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
