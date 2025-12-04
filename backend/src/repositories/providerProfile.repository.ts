import { Repository } from "typeorm";
import { ProviderProfile } from "../models/provider_profiles";

export class ProviderProfileRepository{
    private static repository: Repository<ProviderProfile>


    //Initialize the repo (called once during app startup)
    static initialize(repository: Repository<ProviderProfile>) {
        this.repository=repository
    }

    //Create provider profile
    static async create(data: Partial<ProviderProfile>): Promise<ProviderProfile>{
        const profile = this.repository.create(data)
        return await this.repository.save(profile)

    }

    //Update provider profile
    static async update(
        userId: number,
        data: Partial<ProviderProfile>
    ): Promise<ProviderProfile>{
        await this.repository.update({ provider_id: userId }, data)
        const updated = await this.repository.findOne({
            where:{provider_id: userId}
        })

        if (!updated) throw new Error("Provider profile not found")
        return updated
    }

    //Find profiel by provider user Id
    static async findByProviderId(
        providerId:number
    ): Promise<ProviderProfile | null>{
        return await this.repository.findOne({
            where: { provider_id: providerId },
            relations: ["user"], //optional: remove if you don't always need user

        })
    }

    //check if provider already has a profile (for preventing duplicates)
    static async exists(providerId: number): Promise<boolean>{
        const found = await this.repository.exist({
            where: {provider_id: providerId}
        })
        return found
    }

    //Delete provider profile
    static async delete(providerId: number): Promise<void>{
        await this.repository.delete({provider_id:providerId})
    }
}