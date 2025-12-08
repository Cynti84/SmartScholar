import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { authConfig } from "../config/auth.config";
import { JWTPayload, JwtPayloadData } from "../types/auth.types";

function normalizeExpiresIn(
  value?: string | number
): SignOptions["expiresIn"] | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;
  const s = String(value).trim();
  if (/^\d+$/.test(s)) return Number(s);
  // cast to SignOptions['expiresIn'] to match whatever the installed types expect
  return s as SignOptions["expiresIn"];
}

export class JWTUtil {
  private static secret(): string {
    return (
      authConfig?.jwt?.secret ||
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production-min-32-chars"
    );
  }

  static generateToken(payload: JWTPayload | JwtPayloadData): string {
    const secret = JWTUtil.secret();
    const expiresIn = normalizeExpiresIn(
      process.env.JWT_EXPIRES_IN ?? authConfig?.jwt?.expiresIn ?? "1d"
    );
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload as any, secret, options);
  }

  static generateRefreshToken(payload: JWTPayload | JwtPayloadData): string {
    const secret = JWTUtil.secret();
    const expiresIn = normalizeExpiresIn(
      process.env.JWT_REFRESH_EXPIRES_IN ??
        authConfig?.jwt?.refreshExpiresIn ??
        "7d"
    );
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload as any, secret, options);
  }

  static verifyToken<T = JWTPayload | JwtPayloadData>(token: string): T {
    const secret = JWTUtil.secret();
    return jwt.verify(token, secret) as T;
  }

  static decodeToken(token: string): JWTPayload | JwtPayloadData | null {
    return jwt.decode(token) as JWTPayload | JwtPayloadData | null;
  }
}
