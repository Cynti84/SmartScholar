// src/models/Scholarship.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./users";
import { MatchResult } from "./match_result";
import { Application } from "./applications";
import { Bookmark } from "./Bookmark";
import { JSONB } from "sequelize";
@Entity("scholarships")
export class Scholarship {
  @PrimaryGeneratedColumn()
  scholarship_id!: number;

  @Column({ nullable: true })
  provider_id?: number;

  /* === BASIC INFO === */
  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "varchar", length: 150 })
  organization_name!: string;

  @Column({ type: "varchar", length: 200 })
  short_summary!: string;

  /* === DETAILS === */
  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text" })
  eligibility_criteria!: string;

  @Column({ type: "text" })
  benefits!: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @Column({ type: "date" })
  deadline!: Date;

  /* === CATEGORIZATION === */
  @Column()
  country!: string;

  @Column()
  education_level!: string;

  @Column()
  scholarship_type!: string;

  @Column({ type: "jsonb" })
  fields_of_study!: string[];

  /* === STRUCTURED ELIGIBILITY (NEW) === */

  // male | female | any
  @Column({
    type: "enum",
    enum: ["male", "female", "any"],
    nullable: true,
  })
  eligibility_gender?: "male" | "female" | "any";

  // Example: ['Kenya', 'Uganda'] or ['Any']
  @Column({ type: "jsonb", nullable: true })
  eligibility_countries?: string[];

  @Column({ type: "int", nullable: true })
  min_age?: number;

  @Column({ type: "int", nullable: true })
  max_age?: number;

  // Example: ["Undergraduate", "Masters"]
  @Column({ type: "jsonb", nullable: true })
  eligible_education_levels?: string[];

  // Example: true if only disabled students
  @Column({ type: "boolean", nullable: true })
  requires_disability?: boolean;

  // Example: "low", "middle", "any"
  @Column({ type: "varchar", length: 20, nullable: true })
  income_level?: string;

  /* === APPLICATION === */
  @Column()
  application_link!: string;

  @Column({ type: "text" })
  application_instructions!: string;

  @Column({ nullable: true })
  contact_email?: string;

  @Column({ nullable: true })
  contact_phone?: string;

  /* === FILES === */
  @Column({ nullable: true })
  flyer_url?: string;

  @Column({ nullable: true })
  banner_url?: string;

  @Column({ type: "jsonb", nullable: true })
  verification_docs?: string[];

  /* === ADMIN === */
  @Column({ type: "text", nullable: true })
  admin_notes?: string;

  @Column({
    type: "enum",
    enum: ["draft", "pending", "approved", "rejected", "published"],
    default: "draft",
  })
  status!: string;

  /* === RELATIONS === */

  @ManyToOne(() => User, (user) => user.scholarships, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "provider_id" })
  provider?: User;

  @OneToMany(() => Application, (application) => application.scholarship)
  applications?: Application[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.scholarship)
  bookmarks?: Bookmark[];

  @OneToMany(() => MatchResult, (matchResult) => matchResult.scholarship)
  matchResults?: MatchResult[];
}
