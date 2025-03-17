import { z } from 'zod';

// 中国大陆手机号码验证正则表达式
const phoneRegex = /^1[3-9]\d{9}$/;

// 密码强度验证：至少8位
const passwordRegex = /^.{8,}$/;

export interface RegisterData {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  invitationCode?: string;
}

export interface LoginData {
  phoneNumber: string;
  password: string;
  activationCode?: string;
  invitationCode?: string;
}

export interface ResetPasswordData {
  phoneNumber: string;
  newPassword: string;
  confirmPassword: string;
}

export const registerSchema = z.object({
  phoneNumber: z.string()
    .regex(phoneRegex, '请输入有效的手机号码'),
  password: z.string()
    .regex(passwordRegex, '密码至少8位'),
  confirmPassword: z.string(),
  invitationCode: z.string().optional(),
}).refine((data: RegisterData) => data.password === data.confirmPassword, {
  message: '两次输入的密码不匹配',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  phoneNumber: z.string()
    .regex(phoneRegex, '请输入有效的手机号码'),
  password: z.string().min(1, '请输入密码'),
  activationCode: z.string().optional(),
  invitationCode: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  phoneNumber: z.string()
    .regex(phoneRegex, '请输入有效的手机号码'),
  newPassword: z.string()
    .regex(passwordRegex, '密码至少8位'),
  confirmPassword: z.string(),
}).refine((data: ResetPasswordData) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不匹配',
  path: ['confirmPassword']
});