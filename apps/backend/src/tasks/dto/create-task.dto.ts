import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['epic', 'story', 'task', 'bug'])
  type?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'review', 'done'])
  status?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @IsNumber()
  @IsOptional()
  storyPoints?: number;

  @IsString()
  @IsOptional()
  sprintId?: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}
