import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./users";

// Types of notifications
export enum NotificationType {
  SCHOLARSHIP = "scholarship",
  PROVIDER = "provider",
  STUDENT = "student",
  PENDING = "pending",
}

// Priority levels
export enum NotificationPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

@Entity({ name: "notifications" })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column({ type: "varchar", length: 255 })
  message: string;

  @Column({
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  user?: User; // optional: can be global or for specific admin

  @CreateDateColumn()
  createdAt: Date;
}
