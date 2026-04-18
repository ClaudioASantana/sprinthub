import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Task } from './task.entity';

export enum SprintStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  goal: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: SprintStatus, default: SprintStatus.PLANNED })
  status: SprintStatus;

  @ManyToOne(() => Project, (project) => project.sprints)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @OneToMany(() => Task, (task) => task.sprint)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
