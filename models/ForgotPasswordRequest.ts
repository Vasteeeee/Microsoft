import mongoose, { Document, Model, Schema } from "mongoose";

export interface IForgotPasswordRequest extends Document {
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
}

const forgotPasswordRequestSchema = new Schema<IForgotPasswordRequest>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACCOUNT_NOT_FOUND", "TOKEN_GENERATED"],
      required: true,
    },
    token: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    currentPassword: {
      type: String,
    },
    newPassword: {
      type: String,
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
forgotPasswordRequestSchema.index({ email: 1, timestamp: -1 });

const ForgotPasswordRequest: Model<IForgotPasswordRequest> =
  mongoose.models.ForgotPasswordRequest ||
  mongoose.model<IForgotPasswordRequest>(
    "ForgotPasswordRequest",
    forgotPasswordRequestSchema
  );

export default ForgotPasswordRequest;
