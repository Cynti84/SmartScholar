import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./users";

@Entity("email_preferences")
export class EmailPreference {
  @PrimaryGeneratedColumn()
  email_id!: number;

  @OneToOne(() => User, (user) => user.emailPreferences, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ default: true })
  scholarshipAlerts!: boolean;

  @Column({ default: true })
  applicationUpdates!: boolean;

  @Column({ default: false })
  weeklyDigest!: boolean;

  @Column({ default: true })
  newScholarships!: boolean;

  @Column({ default: true })
  deadlineReminders!: boolean;

  @Column({ default: false })
  marketingEmails!: boolean;
}
