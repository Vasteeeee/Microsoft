import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    if (!ADMIN_PASSWORD) {
      console.error("[admin-login] ADMIN_PASSWORD not configured");
      return NextResponse.json(
        { error: "Admin authentication is not configured." },
        { status: 500 }
      );
    }

    // Check if password matches
    const isValid = password === ADMIN_PASSWORD;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 401 }
      );
    }

    // Create session
    const response = NextResponse.json(
      { success: true, message: "Authenticated successfully" },
      { status: 200 }
    );

    // Set admin session cookie
    response.cookies.set({
      name: "admin_session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("[admin-login] Unexpected error:", error);
    return NextResponse.json(
      { error: "Unable to authenticate. Please try again." },
      { status: 500 }
    );
  }
}
