import { AppDataSource } from "../utils/db";
import { ScholarshipView } from "../models/scholarshipView";

export const ScholarshipViewRepository =
  AppDataSource.getRepository(ScholarshipView);
