// src/models/StudentProfile.ts
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./users";
import { Application } from "./applications";

@Entity("student_profiles")
export class StudentProfile {
  @PrimaryColumn()
  student_id!: number; // FK to User.user_id

  @Column({ type: "date", nullable: true })
  date_of_birth?: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  nationality?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  academic_level?: string;

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  gpa?: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  field_of_study?: string;

  @Column({ type: "text", nullable: true })
  other_info?: string;

  // Associations (User ↔ StudentProfile)
  @OneToOne(() => User, (user) => user.profile, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  user!: User;
  
  @OneToMany(() => Application, (application) => application.student)
  applications!: Application[];
}
