import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://lincolnesparza73629_db_user:zFpwvXZphAoc8AAz@cluster0.iasicng.mongodb.net/outlook-login?retryWrites=true&w=majority";

// User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Test users to seed
const testUsers = [
  {
    email: "test@outlook.com",
    displayName: "Test User",
    password: "password123", // Will be hashed
  },
  {
    email: "john.doe@outlook.com",
    displayName: "John Doe",
    password: "test123",
  },
  {
    email: "admin@outlook.com",
    displayName: "Admin User",
    password: "admin123",
  },
];

async function seedUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing users
    const deleteResult = await User.deleteMany({});
    console.log(`✓ Cleared ${deleteResult.deletedCount} existing users`);

    // Hash passwords and insert users
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await User.create({
        email: userData.email,
        displayName: userData.displayName,
        password: hashedPassword,
      });

      console.log(`✓ Created user: ${userData.email} (password: ${userData.password})`);
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("\nTest credentials:");
    testUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log();
    });

    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedUsers();
