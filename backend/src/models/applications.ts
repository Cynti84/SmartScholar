// src/models/Application.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Check,
} from "typeorm";
import { User } from "./users";
import { Scholarship } from "./scholarships";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

@Entity("applications")
@Check(`"status" IN ('pending', 'accepted', 'rejected')`)
export class Application {
  @PrimaryGeneratedColumn()
  application_id!: number;

  @Column({ nullable: true })
  student_id?: number;

  @Column({ nullable: true })
  scholarship_id?: number;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  application_date!: Date;

  @Column({
    type: "varchar",
    length: 20,
    default: "pending",
  })
  status!: ApplicationStatus;

  @Column({ type: "boolean", default: false })
  applied!: boolean;

  @Column({ type: "text", nullable: true })
  proof_of_application?: string;

  // ✅ Only one student relation
  @ManyToOne(() => User, (user) => user.applications, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  student?: User;

  @ManyToOne(() => Scholarship, (scholarship) => scholarship.applications, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "scholarship_id" })
  scholarship?: Scholarship;
}
