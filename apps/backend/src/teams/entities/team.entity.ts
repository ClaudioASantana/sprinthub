export interface Team {
  id: string;
  name: string;
  description: string;
  companyId: string;
  active: boolean;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamDto {
  name: string;
  description: string;
  companyId: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  active?: boolean;
  members?: string[];
}
