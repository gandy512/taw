export type Role = "student" | "lecturer" | "admin";

export interface AuthUser {
  id: string;
  role: Role;
  username: string;
  name: string;
  surname: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
