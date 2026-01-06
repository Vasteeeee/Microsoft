import type { NextRequest } from "next/server";

export type RequestContext = {
  ipAddress: string;
  location: string;
  userAgent: string;
  cookies: string;
};

export function extractRequestContext(request: NextRequest): RequestContext {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0].trim() ??
    request.ip ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const geo = request.geo;
  const locationParts = [];
  if (geo?.city) {
    locationParts.push(geo.city);
  }
  if (geo?.region) {
    locationParts.push(geo.region);
  }
  if (geo?.country) {
    locationParts.push(geo.country);
  }

  const fallbackLocation =
    request.headers.get("x-vercel-ip-city") ??
    request.headers.get("x-vercel-ip-country") ??
    "";
  const location =
    locationParts.join(", ") || fallbackLocation || "unknown location";

  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const cookies = request.cookies
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return {
    ipAddress,
    location,
    userAgent,
    cookies,
  };
}
