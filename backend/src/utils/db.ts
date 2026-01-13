import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserRepository } from "../repositories/user.repository";
import { ProviderProfileRepository } from "../repositories/providerProfile.repository";
import dotenv from "dotenv";
import { User } from "../models/users";
import { Scholarship } from "../models/scholarships";
import { ProviderProfile } from "../models/provider_profiles";
import { MatchResult } from "../models/match_result";
import { Application } from "../models/applications";
import { StudentProfile } from "../models/student_profiles";
import { Bookmark } from "../models/Bookmark";
import { EmailPreference } from "../models/email_preferences";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Scholarship,
    ProviderProfile,
    MatchResult,
    Application,
    StudentProfile,
    Bookmark,
    EmailPreference,
  ],
  synchronize: false,
  logging: false,
  migrations: ["src/migrations/*.ts"],
});

// Connect function
export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(" Database connected successfully with TypeORM!");

    //Initialize UserRepository
    UserRepository.initialize(AppDataSource.getRepository(User));

    ProviderProfileRepository.initialize(
      AppDataSource.getRepository(ProviderProfile)
    );
    console.log(" Repositories initialized");
  } catch (error) {
    console.error(" Database connection error:", error);
    process.exit(1);
  }
};
