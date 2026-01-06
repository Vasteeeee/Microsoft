import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LoginAttempt from "@/models/LoginAttempt";
import ForgotPasswordRequest from "@/models/ForgotPasswordRequest";

function checkAdminAuth(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session");
  return adminSession?.value === "authenticated";
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");
    const email = searchParams.get("email");
    
    await connectDB();

    // Build query
    const query: any = {};
    if (type) {
      query.type = type;
    }
    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    // Get login attempts
    const [loginAttempts, totalLoginAttempts] = await Promise.all([
      LoginAttempt.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      LoginAttempt.countDocuments(query),
    ]);

    // Get forgot password requests
    const [forgotRequests, totalForgotRequests] = await Promise.all([
      ForgotPasswordRequest.find(email ? { email: { $regex: email, $options: "i" } } : {})
        .sort({ timestamp: -1 })
        .limit(20)
        .lean(),
      ForgotPasswordRequest.countDocuments(email ? { email: { $regex: email, $options: "i" } } : {}),
    ]);

    // Get statistics
    const stats = await LoginAttempt.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = stats.reduce((acc: any, stat: any) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return NextResponse.json({
      loginAttempts,
      forgotRequests,
      pagination: {
        page,
        limit,
        totalLoginAttempts,
        totalForgotRequests,
        totalPages: Math.ceil(totalLoginAttempts / limit),
      },
      statistics: {
        totalAttempts: totalLoginAttempts,
        successfulLogins: statsMap.SIGN_IN_SUCCESS || 0,
        failedLogins: statsMap.SIGN_IN_FAILURE || 0,
        identifies: statsMap.IDENTIFY || 0,
        forgotPasswordRequests: statsMap.FORGOT_PASSWORD || 0,
      },
    });
  } catch (error) {
    console.error("[admin-data] Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data. Make sure MongoDB is connected." },
      { status: 500 }
    );
  }
}
