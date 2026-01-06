import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import LoginAttempt from "@/models/LoginAttempt";
import { extractRequestContext } from "@/lib/requestContext";

export async function POST(request: NextRequest) {
  const context = extractRequestContext(request);

  try {
    const { email } = await request.json();

    if (typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 },
      );
    }

    await connectDB();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "We couldn't find that Microsoft account." },
        { status: 404 },
      );
    }

    // Log identify attempt
    LoginAttempt.create({
      type: "IDENTIFY",
      email: user.email,
      message: "User identified successfully",
      ipAddress: context.ipAddress,
      location: context.location,
      userAgent: context.userAgent,
      cookies: context.cookies,
      timestamp: new Date(),
    }).catch(err => console.error("[identify] Failed to log:", err));

    return NextResponse.json(
      {
        email: user.email,
        displayName: user.displayName,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[identify] Error:", error);
    return NextResponse.json(
      { error: "Unable to verify account. Please try again later." },
      { status: 500 },
    );
  }
}
