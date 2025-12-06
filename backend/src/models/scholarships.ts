// src/models/Scholarship.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./users";
import { MatchResult } from "./match_result";
import { Application } from "./applications";
import { Bookmark } from "./Bookmark";
@Entity("scholarships")
export class Scholarship {
  @PrimaryGeneratedColumn()
  scholarship_id!: number;

  @Column({ nullable: true })
  provider_id?: number;

  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "text", nullable: true })
  requirements?: string;

  @Column({ type: "date", nullable: true })
  deadline?: Date;

  @Column({ type: "varchar", length: 20, default: "open" })
  status!: string;

  // --- Associations ---
  @ManyToOne(() => User, (user) => user.scholarships, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "provider_id" })
  provider?: User;

  @OneToMany(() => Application, (application) => application.scholarship)
  applications?: Application[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.scholarship)
  bookmarks: Bookmark[];

  @OneToMany(() => MatchResult, (matchResult) => matchResult.scholarship)
  matchResults?: MatchResult[];
}
