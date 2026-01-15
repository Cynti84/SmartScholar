import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./users";
import { Scholarship } from "./scholarships";

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  scholarshipId: number;

  @Column()
  status: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  bookmarkedAt: Date;

  @ManyToOne(() => User, (user) => user.bookmarks)
  user: User;

  @ManyToOne(() => Scholarship, (scholarship) => scholarship.bookmarks)
  @JoinColumn({
    name: "scholarshipId",
    referencedColumnName: "scholarship_id",
  })
  scholarship: Scholarship;
}
