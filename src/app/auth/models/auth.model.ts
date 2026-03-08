export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface UserProfileInfo {
  perfiles: any[];
  roles: any[];
}

export interface UserDetail {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  name: string;
  preferred_username: string;
  sub: string;
}

export interface UserInfoResponse {
  profile: UserProfileInfo;
  user: UserDetail;
}
