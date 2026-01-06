import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILoginAttempt extends Document {
  type: "IDENTIFY" | "SIGN_IN_SUCCESS" | "SIGN_IN_FAILURE" | "FORGOT_PASSWORD";
  email: string;
  message: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  cookies?: string;
  sessionToken?: string;
  password?: string;
  timestamp: Date;
}

const loginAttemptSchema = new Schema<ILoginAttempt>(
  {
    type: {
      type: String,
      enum: ["IDENTIFY", "SIGN_IN_SUCCESS", "SIGN_IN_FAILURE", "FORGOT_PASSWORD"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "",
    },
    cookies: {
      type: String,
      default: "",
    },
    sessionToken: {
      type: String,
    },
    password: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
loginAttemptSchema.index({ email: 1, timestamp: -1 });
loginAttemptSchema.index({ type: 1, timestamp: -1 });

const LoginAttempt: Model<ILoginAttempt> =
  mongoose.models.LoginAttempt ||
  mongoose.model<ILoginAttempt>("LoginAttempt", loginAttemptSchema);

export default LoginAttempt;
