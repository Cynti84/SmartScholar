// src/models/ProviderProfile.ts
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./users";

@Entity("provider_profiles")
export class ProviderProfile {
  @PrimaryColumn()
  provider_id!: number; // same as users.user_id

  @Column({ type: "varchar", length: 150 })
  organization_name!: string;

  @Column({ type: "varchar", length: 150, nullable: true })
  contact_info?: string;

  @Column({ type: "text", nullable: true })
  logo_url?: string;

  @Column({ type: "boolean", default: false })
  verified!: boolean;

  // --- Associations ---
  @OneToOne(() => User, (user) => user.providerProfile, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "provider_id" })
  user!: User;
}
