import jwt, { SignOptions } from "jsonwebtoken";
import { authConfig } from "../config/auth.config";
import { JWTPayload, JwtPayloadData } from "../types/auth.types";

export class JWTUtil {
  private static secret(): string {
    return (
      (authConfig && authConfig.jwt && authConfig.jwt.secret) ||
      process.env.JWT_SECRET ||
      "default_secret"
    );
  }

  /**
   * Generate access token
   */
  static generateToken(payload: JWTPayload | JwtPayloadData): string {
    const secret = JWTUtil.secret();
    const expiresIn: string | number = authConfig?.jwt?.expiresIn ?? "1h"; // ensure string|number
    const options: SignOptions = { expiresIn };

    return jwt.sign(payload as jwt.JwtPayload, secret, options);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JWTPayload | JwtPayloadData): string {
    const secret = JWTUtil.secret();
    const expiresIn: string | number =
      authConfig?.jwt?.refreshExpiresIn ?? "7d"; // <-- normalized here
    const options: SignOptions = { expiresIn };

    return jwt.sign(payload as jwt.JwtPayload, secret, options);
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload | JwtPayloadData {
    const secret = JWTUtil.secret();
    return jwt.verify(token, secret) as JWTPayload | JwtPayloadData;
  }

  /**
   * Decode token (no verification) — useful for debugging
   */
  static decodeToken(token: string): JWTPayload | JwtPayloadData | null {
    try {
      return jwt.decode(token) as JWTPayload | JwtPayloadData;
    } catch {
      return null;
    }
  }
}
