import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || new Date().getFullYear();
    
    // Get monthly sales data
    const monthlySalesQuery = `
      SELECT 
        MONTH(dateCreated) as month,
        SUM(totalAmount) as revenue,
        COUNT(*) as orders
      FROM client_invoices 
      WHERE YEAR(dateCreated) = ?
      GROUP BY MONTH(dateCreated)
      ORDER BY month
    `;
    
    const monthlySalesResult = await query(monthlySalesQuery, [year]);
    
    // Format data for all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const formattedData = months.map((month, index) => {
      // Find the data for this month (database month is 1-based)
      const monthData = Array.isArray(monthlySalesResult) 
        ? monthlySalesResult.find((item: any) => item.month === index + 1)
        : null;
      
      // Calculate growth compared to previous month
      let growth = 0;
      if (monthData && index > 0) {
        const prevMonthData = monthlySalesResult.find((item: any) => item.month === index);
        if (prevMonthData) {
          growth = ((monthData.revenue - prevMonthData.revenue) / prevMonthData.revenue) * 100;
        }
      }
      
      return {
        month: `${month} ${year}`,
        revenue: monthData ? Number(monthData.revenue) : 0,
        orders: monthData ? Number(monthData.orders) : 0,
        averageOrderValue: monthData && monthData.orders > 0 
          ? Number(monthData.revenue) / Number(monthData.orders) 
          : 0,
        growth
      };
    });
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching monthly sales data:", error);
    return NextResponse.json({ error: "Failed to fetch monthly sales data" }, { status: 500 });
  }
}