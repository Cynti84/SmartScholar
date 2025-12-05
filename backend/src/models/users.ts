// src/models/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { StudentProfile } from "./student_profiles";
import { Scholarship } from "./scholarships";
import { ProviderProfile } from "./provider_profiles";
import { MatchResult } from "./match_result";
import { Application } from "./applications";

// Enums
export enum UserRole {
  STUDENT = "student",
  PROVIDER = "provider",
  ADMIN = "admin",
}

export enum UserStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ type: "timestamp", nullable: true })
  verificationTokenExpires: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => StudentProfile, (profile) => profile.user)
  profile?: StudentProfile;

  @OneToMany(() => Scholarship, (scholarship) => scholarship.provider)
  scholarships?: Scholarship[];

  @OneToOne(() => ProviderProfile, (profile) => profile.user)
  providerProfile?: ProviderProfile;

  @OneToMany(() => MatchResult, (matchResult) => matchResult.student)
  matchResults?: MatchResult[];

  @OneToMany(() => Application, (application) => application.student, {
    cascade: true,
  })
  applications!: Application[];
}
