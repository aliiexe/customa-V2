import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Check if we have any clients
    const clientsExistQuery = "SELECT COUNT(*) as count FROM clients";
    const clientsExistResult = await query(clientsExistQuery);
    
    if (!Array.isArray(clientsExistResult) || 
        clientsExistResult.length === 0 || 
        clientsExistResult[0].count === 0) {
      console.log("No clients found");
      return NextResponse.json([]);
    }

    // Get total revenue
    const totalRevenueQuery = `
      SELECT COALESCE(SUM(totalAmount), 0) as totalRevenue
      FROM client_invoices
      WHERE payment_status = 'PAID'
    `;
    const totalRevenueResult = await query(totalRevenueQuery);
    const totalRevenue = Array.isArray(totalRevenueResult) && totalRevenueResult.length > 0 
      ? Number(totalRevenueResult[0].totalRevenue) 
      : 0;
    
    console.log("Total revenue:", totalRevenue);
    
    // If no revenue, show clients with 0 contribution
    if (totalRevenue === 0) {
      const topClientsQuery = `
        SELECT 
          id,
          name
        FROM 
          clients
        ORDER BY 
          name ASC
        LIMIT 5
      `;
      
      const topClientsResult = await query(topClientsQuery);
      
      if (Array.isArray(topClientsResult)) {
        const zeroContributions = topClientsResult.map(client => ({
          id: client.id,
          name: client.name,
          revenue: 0,
          percentage: 0
        }));
        
        return NextResponse.json(zeroContributions);
      }
      
      return NextResponse.json([]);
    }
    
    // Get clients with their revenue contributions
    const contributionsQuery = `
      SELECT 
        c.id,
        c.name,
        COALESCE(SUM(CASE WHEN ci.payment_status = 'PAID' THEN ci.totalAmount ELSE 0 END), 0) as revenue
      FROM 
        clients c
      LEFT JOIN 
        client_invoices ci ON c.id = ci.clientId
      GROUP BY 
        c.id, c.name
      ORDER BY 
        revenue DESC, c.name ASC
      LIMIT 5
    `;
    
    const contributionsResult = await query(contributionsQuery);
    console.log("Contributions query result:", contributionsResult);
    
    if (!Array.isArray(contributionsResult)) {
      return NextResponse.json([]);
    }
    
    // Format the data
    const formattedData = contributionsResult.map(client => ({
      id: client.id,
      name: client.name,
      revenue: Number(client.revenue || 0),
      percentage: totalRevenue > 0 ? (Number(client.revenue || 0) / totalRevenue * 100) : 0
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching client contributions:", error);
    return NextResponse.json([]);
  }
}