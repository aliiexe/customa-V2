import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Get monthly revenue data for the current year
    const currentYear = new Date().getFullYear()

    // Get revenue by month (from client invoices)
    const revenueQuery = `
      SELECT 
        MONTH(dateCreated) as month,
        SUM(totalAmount) as revenue
      FROM 
        client_invoices
      WHERE 
        YEAR(dateCreated) = ?
      GROUP BY 
        MONTH(dateCreated)
      ORDER BY 
        month
    `

    const revenueResult = await query(revenueQuery, [currentYear])

    // Get expenses by month (from supplier invoices)
    const expensesQuery = `
      SELECT 
        MONTH(dateCreated) as month,
        SUM(totalAmount) as expenses
      FROM 
        supplier_invoices
      WHERE 
        YEAR(dateCreated) = ?
      GROUP BY 
        MONTH(dateCreated)
      ORDER BY 
        month
    `

    const expensesResult = await query(expensesQuery, [currentYear])

    // Create a complete dataset with all months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const chartData = months.map((name, index) => {
      // Month in database is 1-based, but our index is 0-based
      const monthNumber = index + 1

      // Find revenue for this month
      const monthRevenue = Array.isArray(revenueResult)
        ? revenueResult.find((item: any) => item.month === monthNumber)
        : null

      // Find expenses for this month
      const monthExpenses = Array.isArray(expensesResult)
        ? expensesResult.find((item: any) => item.month === monthNumber)
        : null

      return {
        name,
        revenue: monthRevenue ? Number(monthRevenue.revenue) : 0,
        expenses: monthExpenses ? Number(monthExpenses.expenses) : 0,
      }
    })

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching revenue chart data:", error)
    return NextResponse.json({ error: "Failed to fetch revenue chart data" }, { status: 500 })
  }
}
