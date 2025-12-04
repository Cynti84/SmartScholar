import { AppDataSource } from "../utils/db";
import { ProviderProfile } from "../models/provider_profiles";
import { User } from "../models/users";

export class ProviderProfileService {
  /**
   * Safely get repositories after the datasource is initialized
   */
  private get providerRepo() {
    return AppDataSource.getRepository(ProviderProfile);
  }

  private get userRepo() {
    return AppDataSource.getRepository(User);
  }

  /**
   * Create a provider profile
   */
  async createProfile(userId: number, data: Partial<ProviderProfile>) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const existing = await this.providerRepo.findOne({
      where: { user: { id: userId } },
    });

    if (existing) throw new Error("Provider profile already exists");

    const profile = this.providerRepo.create({
      ...data,
      user,
    });

    return await this.providerRepo.save(profile);
  }

  /**
   * Get provider profile by user ID
   */
  async getProfile(userId: number) {
    const profile = await this.providerRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    if (!profile) throw new Error("Provider profile not found");

    return profile;
  }

  /**
   * Update provider profile
   */
  async updateProfile(userId: number, data: Partial<ProviderProfile>) {
    const profile = await this.providerRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) throw new Error("Provider profile not found");

    Object.assign(profile, data);

    return await this.providerRepo.save(profile);
  }

  /**
   * Delete provider profile
   */
  async deleteProfile(userId: number) {
    const profile = await this.providerRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) throw new Error("Provider profile not found");

    await this.providerRepo.remove(profile);

    return { message: "Provider profile deleted successfully" };
  }
}

export const providerProfileService = new ProviderProfileService();
