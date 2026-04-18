import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sprint } from './sprint.entity';

export enum TaskType {
  TASK = 'task',
  STORY = 'story',
  EPIC = 'epic',
  BUG = 'bug',
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskType, default: TaskType.TASK })
  type: TaskType;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.BACKLOG })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ default: 0 })
  storyPoints: number;

  @Column({ nullable: true })
  assigneeId: string;

  @ManyToOne(() => Sprint, (sprint) => sprint.tasks, { nullable: true })
  @JoinColumn({ name: 'sprintId' })
  sprint: Sprint;

  @Column({ nullable: true })
  sprintId: string;

  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
