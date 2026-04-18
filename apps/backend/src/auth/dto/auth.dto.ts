export class AuthCallbackDto {
  code: string;
  state?: string;
}

export class UserDto {
  id: string;
  email: string;
  profile: string;
  name?: string;
  companyId?: string;
  role?: string;
}

export class AuthResponseDto {
  access_token: string;
  user: UserDto;
}
