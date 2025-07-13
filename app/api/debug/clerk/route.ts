import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        publishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10),
        secretKeyPrefix: process.env.CLERK_SECRET_KEY?.substring(0, 10),
    });
} 