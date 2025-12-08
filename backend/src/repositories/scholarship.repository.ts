import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
import { Application } from "../models/applications";

export const ScholarshipRepository = AppDataSource.getRepository(Scholarship);
export const ApplicationRepository = AppDataSource.getRepository(Application)
