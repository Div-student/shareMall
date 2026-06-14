import request from '@/api/request';
import type { UserInfo } from '@/stores/user';

export interface AuthResult {
  token: string;
  userInfo: UserInfo;
}

export function sendSms(phone: string, scene: 'register' | 'login' | 'reset') {
  return request.post<unknown, { sent: boolean }>('/auth/sms', { phone, scene });
}

export function register(data: {
  phone: string;
  smsCode: string;
  password: string;
  inviteCode?: string;
}) {
  return request.post<unknown, AuthResult>('/auth/register', data);
}

export function login(data: { phone: string; password: string }) {
  return request.post<unknown, AuthResult>('/auth/login', data);
}

export function loginSms(data: { phone: string; smsCode: string }) {
  return request.post<unknown, AuthResult>('/auth/login-sms', data);
}

export function resetPassword(data: { phone: string; smsCode: string; newPassword: string }) {
  return request.post<unknown, { success: boolean }>('/auth/reset-password', data);
}
