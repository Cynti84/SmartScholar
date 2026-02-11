import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./users";
import { Scholarship } from "./scholarships";

@Entity("scholarship_views")
@Unique(["userId", "scholarshipId"]) // one view per student per scholarship
export class ScholarshipView {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  scholarshipId!: number;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  viewedAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user?: User;

  @ManyToOne(() => Scholarship, (scholarship) => scholarship.views, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "scholarshipId" })
  scholarship?: Scholarship;
}
