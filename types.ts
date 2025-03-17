export interface User {
  id: string;
  phoneNumber: string;
  passwordHash: string;
  registeredAt: string;
  lastLoginAt: string | null;
  invitedBy?: string;
  isActive: boolean;
}

export interface ActivationCode {
  code: string;
  isUsed: boolean;
  usageCount: number;
  maxUsage: number;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationCode {
  code: string;
  userId: string;
  usageCount: number;
  maxUsage: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
} 