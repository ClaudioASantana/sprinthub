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
import { Company } from './company.entity';
import { Sprint } from './sprint.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Company, (company) => company.projects)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  companyId: string;

  @OneToMany(() => Sprint, (sprint) => sprint.project)
  sprints: Sprint[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
