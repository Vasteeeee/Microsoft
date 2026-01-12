/* eslint-disable @typescript-eslint/no-explicit-any */
// Dynamic import to avoid build errors when googleapis is not installed
type SpreadsheetConfig = {
  spreadsheetId: string;
  usersSheet: string;
  auditSheet: string;
  forgotSheet: string;
};

type GoogleSheetsUser = {
  rowIndex: number;
  email: string;
  password: string;
  displayName?: string;
  resetToken?: string;
  resetTokenExpiresAt?: string;
};

let sheetsClient: any = null;

function getEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
}

function getSpreadsheetConfig(): SpreadsheetConfig {
  return {
    spreadsheetId: getEnv("GOOGLE_SHEETS_SPREADSHEET_ID"),
    usersSheet: process.env.GOOGLE_SHEETS_USERS_SHEET ?? "Users",
    auditSheet: process.env.GOOGLE_SHEETS_AUDIT_SHEET ?? "AuditLog",
    forgotSheet: process.env.GOOGLE_SHEETS_FORGOT_SHEET ?? "ForgotRequests",
  };
}

async function getSheetsClient() {
  if (sheetsClient) {
    return sheetsClient;
  }

  try {
    const { google } = await import("googleapis");
    const clientEmail = getEnv("GOOGLE_SHEETS_CLIENT_EMAIL");
    const privateKey = getEnv("GOOGLE_SHEETS_PRIVATE_KEY").replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
  } catch {
    throw new Error("googleapis package not installed. Run: npm install googleapis");
  }
}

async function getUserRows() {
  const config = getSpreadsheetConfig();
  const sheets = await getSheetsClient();
  const range = `${config.usersSheet}!A1:Z`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range,
  });

  const rows = response.data.values ?? [];
  const [header, ...dataRows] = rows;

  if (!header) {
    throw new Error(
      `Users sheet "${config.usersSheet}" is missing a header row.`,
    );
  }

  return {
    header,
    dataRows,
  };
}

function normalizeHeaderIndex(header: string[], label: string) {
  const index = header.findIndex(
    (column: string) => column.trim().toLowerCase() === label.toLowerCase(),
  );
  if (index === -1) {
    throw new Error(
      `Expected column "${label}" not found in sheet "${getSpreadsheetConfig().usersSheet}".`,
    );
  }
  return index;
}

function columnIndexToLetter(index: number) {
  let column = "";
  let dividend = index + 1;

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    column = String.fromCharCode(65 + modulo) + column;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return column;
}

export async function findUserByEmail(
  email: string,
): Promise<GoogleSheetsUser | null> {
  const { header, dataRows } = await getUserRows();
  const emailIndex = normalizeHeaderIndex(header, "Email");
  const passwordIndex = normalizeHeaderIndex(header, "Password");
  const displayNameIndex = header.findIndex(
    (column: string) => column.trim().toLowerCase() === "displayname",
  );
  const resetTokenIndex = header.findIndex(
    (column: string) => column.trim().toLowerCase() === "resettoken",
  );
  const resetTokenExpiresIndex = header.findIndex(
    (column: string) => column.trim().toLowerCase() === "resettokenexpiresat",
  );

  for (let rowNumber = 0; rowNumber < dataRows.length; rowNumber += 1) {
    const row = dataRows[rowNumber];
    const candidateEmail = (row[emailIndex] ?? "").trim().toLowerCase();
    if (candidateEmail !== email.toLowerCase()) {
      continue;
    }

    const user: GoogleSheetsUser = {
      rowIndex: rowNumber + 2, // account for header row and 1-based indexing
      email: candidateEmail,
      password: row[passwordIndex] ?? "",
    };

    if (displayNameIndex !== -1) {
      user.displayName = row[displayNameIndex];
    }

    if (resetTokenIndex !== -1) {
      user.resetToken = row[resetTokenIndex];
    }

    if (resetTokenExpiresIndex !== -1) {
      user.resetTokenExpiresAt = row[resetTokenExpiresIndex];
    }

    return user;
  }

  return null;
}

export async function updateUserResetToken(
  email: string,
  token: string,
  expiresAt: Date,
) {
  const config = getSpreadsheetConfig();
  const sheets = await getSheetsClient();
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error(`User with email ${email} was not found.`);
  }

  const { header } = await getUserRows();

  const resetTokenIndex = header.findIndex(
    (column: string) => column.trim().toLowerCase() === "resettoken",
  );
  const resetTokenExpiresIndex = header.findIndex(
    (column: string) => column.trim().toLowerCase() === "resettokenexpiresat",
  );

  if (resetTokenIndex === -1 || resetTokenExpiresIndex === -1) {
    throw new Error(
      `Sheet "${config.usersSheet}" needs "ResetToken" and "ResetTokenExpiresAt" columns.`,
    );
  }

  const startIndex = Math.min(resetTokenIndex, resetTokenExpiresIndex);
  const endIndex = Math.max(resetTokenIndex, resetTokenExpiresIndex);
  const startColumn = columnIndexToLetter(startIndex);
  const endColumn = columnIndexToLetter(endIndex);

  const rowValues = new Array(endIndex - startIndex + 1).fill("");
  rowValues[resetTokenIndex - startIndex] = token;
  rowValues[resetTokenExpiresIndex - startIndex] = expiresAt.toISOString();

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: `${config.usersSheet}!${startColumn}${user.rowIndex}:${endColumn}${user.rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [rowValues],
    },
  });
}

type AuditEvent = {
  type: "SIGN_IN_SUCCESS" | "SIGN_IN_FAILURE" | "FORGOT_PASSWORD";
  email: string;
  message: string;
  timestamp?: Date;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  cookies?: string;
  sessionToken?: string;
};

export async function appendAuditEvent(event: AuditEvent) {
  const config = getSpreadsheetConfig();
  const sheets = await getSheetsClient();
  const timestamp = (event.timestamp ?? new Date()).toISOString();

  const range = `${config.auditSheet}!A:I`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          timestamp,
          event.email,
          event.type,
          event.message,
          event.ipAddress ?? "",
          event.location ?? "",
          event.userAgent ?? "",
          event.cookies ?? "",
          event.sessionToken ?? "",
        ],
      ],
    },
  });
}

type ForgotPasswordRecord = {
  email: string;
  status: "ACCOUNT_NOT_FOUND" | "TOKEN_GENERATED";
  token?: string;
  expiresAt?: Date;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  cookies?: string;
};

export async function appendForgotPasswordRequest(
  record: ForgotPasswordRecord,
) {
  const config = getSpreadsheetConfig();
  const sheets = await getSheetsClient();
  const timestamp = new Date().toISOString();

  const range = `${config.forgotSheet}!A:I`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          timestamp,
          record.email,
          record.status,
          record.token ?? "",
          record.expiresAt ? record.expiresAt.toISOString() : "",
          record.ipAddress ?? "",
          record.location ?? "",
          record.userAgent ?? "",
          record.cookies ?? "",
        ],
      ],
    },
  });
}
