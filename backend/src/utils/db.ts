import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv"
import { User } from "../models/users";
import { Scholarship } from "../models/scholarships";
import { ProviderProfile } from "../models/provider_profiles";
import { MatchResult } from "../models/match_result";
import { Application } from "../models/applications";
import { StudentProfile } from "../models/student_profiles";

dotenv.config()


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  entities: [
    User,
    Scholarship,
    ProviderProfile,
    MatchResult,
    Application,
    StudentProfile,
  ],
  synchronize: false, 
  logging: false,
  migrations: ["src/migrations/*.ts"],
});

// Connect function
export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully with TypeORM!");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};
