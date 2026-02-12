// src/models/MatchResult.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./users";
import { Scholarship } from "./scholarships";

@Entity("match_results")
export class MatchResult {
  @PrimaryGeneratedColumn()
  match_id!: number;

  @Column({ type: "numeric", precision: 5, scale: 2, nullable: true })
  match_score?: number;

  // ✅ NEW: Explainability fields
  @Column({ type: "jsonb", nullable: true })
  matched_criteria?: string[];

  @Column({ type: "jsonb", nullable: true })
  unmatched_criteria?: string[];

  // --- Associations ---

  @ManyToOne(() => User, (user) => user.matchResults, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  student?: User;

  @ManyToOne(() => Scholarship, (scholarship) => scholarship.matchResults, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "scholarship_id" })
  scholarship?: Scholarship;
}
