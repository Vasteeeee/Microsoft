import { randomBytes, timingSafeEqual } from "crypto";

export function passwordsMatch(candidate: string, stored: string) {
  const candidateBuffer = Buffer.from(candidate.trim());
  const storedBuffer = Buffer.from(stored.trim());

  if (candidateBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, storedBuffer);
}

export function createResetToken() {
  return randomBytes(32).toString("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}
