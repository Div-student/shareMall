import request from '@/api/request';

export type KycStatus = 'none' | 'pending' | 'passed' | 'rejected';

export interface KycInfo {
  status: KycStatus;
  realName: string;
  idCardNo: string;
  rejectReason: string;
  submittedAt: string | null;
  auditedAt: string | null;
}

export function fetchKycStatus() {
  return request.get<unknown, KycInfo>('/user/kyc');
}

export function submitKyc(data: { realName: string; idCardNo: string }) {
  return request.post<unknown, { status: KycStatus }>('/user/kyc', data);
}
