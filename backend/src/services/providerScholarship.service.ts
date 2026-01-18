import { ScholarshipRepository } from "../repositories/scholarship.repository";
import { Scholarship } from "../models/scholarships";
import { normalizeFieldOfStudy } from "../helpers/providerScholarship.helpers";

export class ProviderScholarshipSerivice {
  async createScholarship(providerId: number, data: Partial<Scholarship>) {
    const { status, provider_id, fields_of_study, ...safeData } = data;

    const scholarship = ScholarshipRepository.create({
      ...safeData,
      provider_id: providerId,
      status: "pending",
      fields_of_study: normalizeFieldOfStudy(fields_of_study),
    });

    return await ScholarshipRepository.save(scholarship);
  }

  async getAllProviderScholarships(providerId: number) {
    return await ScholarshipRepository.find({
      where: {
        provider_id: providerId,
      },
    });
  }

  async getScholarshipById(providerId: number, id: number) {
    if (!Number.isInteger(id)) {
      throw new Error("Invalid scholarshipId passed to service.");
    }
    const scholarship = await ScholarshipRepository.findOne({
      where: { scholarship_id: id, provider_id: providerId },
    });

    if (!scholarship) throw new Error("Scholarship not found");

    return scholarship;
  }

  async updateScholarship(
    providerId: number,
    id: number,
    data: Partial<Scholarship>
  ) {
    const scholarship = await this.getScholarshipById(providerId, id);

    if ("fields_of_study" in data) {
      scholarship.fields_of_study = normalizeFieldOfStudy(data.fields_of_study);
      delete data.fields_of_study;
    }

    Object.assign(scholarship, data);

    return await ScholarshipRepository.save(scholarship);
  }

  async deleteScholarship(providerId: number, id: number) {
    const scholarship = await this.getScholarshipById(providerId, id);

    await ScholarshipRepository.remove(scholarship);

    return { message: "Scholarship deleted successfully" };
  }
}

export const providerScholarshipSerivice = new ProviderScholarshipSerivice();
