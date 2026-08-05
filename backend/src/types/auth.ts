export type Role = "student" | "lecturer" | "admin";

export interface AuthPayload {
  id: string;
  role: Role;
  username: string;
}
