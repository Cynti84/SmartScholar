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
import { Notification } from "../models/notifications";
import { ScholarshipView } from "../models/scholarshipView";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",

  ...(isProduction
    ? {
        url: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),

  entities: [
    User,
    Scholarship,
    ProviderProfile,
    MatchResult,
    Application,
    StudentProfile,
    Bookmark,
    EmailPreference,
    Notification,
    ScholarshipView,
  ],

  synchronize: false,
  logging: false,
  migrations: ["dist/migrations/*.js"],
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
