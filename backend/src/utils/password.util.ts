const bcrypt = require("bcrypt");

import { authConfig } from "../config/auth.config";

export class PasswordUtil {
  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(authConfig.bcrypt.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error("Error hashing password");
    }
  }

  /**
   * Compare plain text password with hashed password
   */
  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error("Error comparing passwords");
    }
  }

  /**
   * Generate random token for email verification or password reset
   */
  static generateToken(): string {
    return require("crypto").randomBytes(32).toString("hex");
  }
}
