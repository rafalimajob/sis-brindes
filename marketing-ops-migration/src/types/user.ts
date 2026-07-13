import type { UserRole, UserStatus } from "@/generated/prisma/client";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mfaEnabled: boolean;
  createdAt: string;
}
