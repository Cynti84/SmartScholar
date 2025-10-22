import { Repository } from "typeorm";
import { User } from "../models/users";

export class UserRepository {
  private static repository: Repository<User>;

  // Initialize repository (call this once with your data source)
  static initialize(repository: Repository<User>) {
    this.repository = repository;
  }

  // Create a new user
  static async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data); // create entity
    return await this.repository.save(user); // save to DB
  }

  // Update existing user
  static async update(id: number, data: Partial<User>): Promise<User> {
    // update returns UpdateResult, not the entity
    await this.repository.update(id, data);

    // fetch the updated user
    const updatedUser = await this.repository.findOne({ where: { id } });
    if (!updatedUser) throw new Error("User not found");
    return updatedUser;
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  // Find user by verification token
  static async findByVerificationToken(token: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { verificationToken: token },
    });
  }

  // Find user by reset token
  static async findByResetToken(token: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { resetPasswordToken: token },
    });
  }
}
