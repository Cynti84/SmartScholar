import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./users";
import { Application } from "./applications";

@Entity("student_profiles")
export class StudentProfile {
  @PrimaryColumn()
  student_id!: number; // FK to users.user_id

  // --- Frontend synced fields ---
  @Column({ type: "varchar", length: 100 })
  country!: string;

  @Column({ type: "varchar", length: 100 })
  academic_level!: string;

  @Column({ type: "varchar", length: 150 })
  field_of_study!: string;

  @Column({ type: "text", nullable: true })
  interest?: string;

  @Column({ type: "text", nullable: true })
  profile_image_url?: string;

  @Column({ type: "text", nullable: true })
  cv_url?: string;

  // --- New fields (for better scholarship matching) ---
  @Column({ type: "date", nullable: true })
  date_of_birth?: Date;

  @Column({
    type: "enum",
    enum: ["male", "female", "other"],
    nullable: true,
  })
  gender?: "male" | "female" | "other";

  @Column({
    type: "boolean",
    nullable: true,
    default: null,
  })
  financial_need?: boolean | null;

  // --- Timestamps ---
  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;

  // --- Associations ---
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  user!: User;

  @OneToMany(() => Application, (application) => application.student)
  applications!: Application[];
}
