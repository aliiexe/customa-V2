import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Update the status of the supplier quote
    const result = await query(
      `UPDATE supplier_quotes SET status = ?, updatedAt = NOW() WHERE id = ?`,
      [status, id]
    )

    return NextResponse.json({ message: "Status updated successfully" })
  } catch (error) {
    console.error("Error updating supplier quote status:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
} 