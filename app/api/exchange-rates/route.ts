import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Using Exchange Rate API (free tier)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates')
        }

        const data = await response.json()

        // Return the rates with timestamp
        return NextResponse.json({
            rates: data.rates,
            base: data.base,
            date: data.date,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error fetching exchange rates:', error)

        // Return fallback rates
        return NextResponse.json({
            rates: {
                USD: 1,
                EUR: 0.85,
                GBP: 0.73,
                CAD: 1.25,
                AUD: 1.35,
                JPY: 110,
                MAD: 9.5,
            },
            base: 'USD',
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            fallback: true
        })
    }
} 