// src/models/User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm";
import { StudentProfile } from "./student_profiles";
import { Scholarship } from "./scholarships";
import { ProviderProfile } from "./provider_profiles";
import { MatchResult } from "./match_result";
import { Application } from "./applications";

export type UserRole = "student" | "provider" | "admin";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  user_id!: number;

  @Column({ type: "varchar", length: 100 })
  full_name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "enum", enum: ["student", "provider", "admin"] })
  role!: UserRole;

  // Relation (User ↔ StudentProfile)
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
