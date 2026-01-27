// src/models/ProviderProfile.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./users";

@Entity("provider_profiles")
export class ProviderProfile {
  @PrimaryColumn()
  provider_id!: number;

  @Column({ type: "varchar", length: 150 })
  organization_name!: string;

  @Column({ type: "varchar", length: 100 })
  organization_type!: string;

  @Column({ type: "varchar", length: 100 })
  country!: string;

  @Column({ type: "varchar", length: 150 })
  contact_email!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ type: "text", nullable: true })
  logo_url?: string;

  @Column({ type: "text", array: true, nullable: true })
  verification_docs?: string[];

  @Column({ type: "boolean", default: false })
  verified!: boolean;

  // --- Timestamps ---
  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;

  // --- Relations ---
  @OneToOne(() => User, (user) => user.providerProfile, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "provider_id" })
  user!: User;
}
