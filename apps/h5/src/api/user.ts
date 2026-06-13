import request from '@/api/request';

export interface UserProfile {
  id: number;
  phone: string;
  nickname: string;
  avatar: string;
  inviteCode: string;
  kycStatus: string;
  invitedCount: number;
  fund: {
    pendingFund: number;
    availableFund: number;
    withdrawableCash: number;
  };
}

export function fetchProfile() {
  return request.get<unknown, UserProfile>('/user/profile');
}

export interface InviteItem {
  id: number;
  phone: string;
  nickname: string;
  createdAt: string;
}

export interface InviteInfo {
  inviteCode: string;
  invitedCount: number;
  list: InviteItem[];
}

export function fetchInvite() {
  return request.get<unknown, InviteInfo>('/user/invite');
}
