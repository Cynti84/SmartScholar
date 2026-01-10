import { ScholarshipRepository } from "../repositories/scholarship.repository";
import { Scholarship } from "../models/scholarships";

export class ProviderScholarshipSerivice {
  async createScholarship(providerId: number, data: Partial<Scholarship>) {

    const {status, admin_notes, provider_id, ...safeData}= data

    const scholarship = ScholarshipRepository.create({
      ...safeData,
      provider_id: providerId,
      status: "pending"
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
