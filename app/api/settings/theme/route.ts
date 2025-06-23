import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();
    const validThemes = ["green", "red", "purple", "blue"];
    
    if (!validThemes.includes(theme)) {
      return NextResponse.json(
        { error: "Invalid theme" }, 
        { status: 400 }
      );
    }
    
    // For Next.js 14+, use the Response API with cookies
    const response = NextResponse.json({ success: true });
    
    // Set the cookie in the response
    response.cookies.set("app-theme", theme, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow JS access
    });
    
    return response;
  } catch (error) {
    console.error("Error setting theme:", error);
    return NextResponse.json(
      { error: "Failed to set theme" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const theme = cookieStore.get("app-theme")?.value || "green";
    return NextResponse.json({ theme });
  } catch (error) {
    console.error("Error getting theme:", error);
    return NextResponse.json({ theme: "green" });
  }
}