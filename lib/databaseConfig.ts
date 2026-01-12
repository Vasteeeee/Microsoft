// Database Configuration
// Set DATABASE_TYPE in your .env file to choose your database
// Options: mongodb, supabase, firebase, postgresql, mysql

export type DatabaseType = "mongodb" | "supabase" | "firebase" | "postgresql" | "mysql";

export interface DatabaseConfig {
  type: DatabaseType;
  connectionString?: string;
  options?: Record<string, unknown>;
}

export function getDatabaseConfig(): DatabaseConfig {
  const dbType = (process.env.DATABASE_TYPE || "mongodb").toLowerCase() as DatabaseType;

  switch (dbType) {
    case "mongodb":
      return {
        type: "mongodb",
        connectionString: process.env.MONGODB_URI,
      };

    case "supabase":
      return {
        type: "supabase",
        connectionString: process.env.SUPABASE_URL,
        options: {
          apiKey: process.env.SUPABASE_ANON_KEY,
          serviceKey: process.env.SUPABASE_SERVICE_KEY,
        },
      };

    case "firebase":
      return {
        type: "firebase",
        options: {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        },
      };

    case "postgresql":
      return {
        type: "postgresql",
        connectionString: process.env.POSTGRES_URI || process.env.DATABASE_URL,
      };

    case "mysql":
      return {
        type: "mysql",
        connectionString: process.env.MYSQL_URI,
      };

    default:
      return {
        type: "mongodb",
        connectionString: process.env.MONGODB_URI,
      };
  }
}

export function isDatabaseConfigured(): boolean {
  const config = getDatabaseConfig();

  switch (config.type) {
    case "mongodb":
      return !!config.connectionString;

    case "supabase":
      return !!(config.connectionString && config.options?.apiKey);

    case "firebase":
      return !!(
        config.options?.projectId &&
        config.options?.clientEmail &&
        config.options?.privateKey
      );

    case "postgresql":
    case "mysql":
      return !!config.connectionString;

    default:
      return false;
  }
}
