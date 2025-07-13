import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { currency } = await request.json()

        // Validate currency
        const validCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "MAD"]
        if (!validCurrencies.includes(currency)) {
            return NextResponse.json({ error: "Invalid currency" }, { status: 400 })
        }

        // Here you could save to database if needed
        // For now, we'll just return success since the client handles localStorage

        return NextResponse.json({
            message: "Currency setting updated successfully",
            currency
        })
    } catch (error) {
        console.error("Error updating currency setting:", error)
        return NextResponse.json({ error: "Failed to update currency setting" }, { status: 500 })
    }
} 