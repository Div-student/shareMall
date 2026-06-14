import request from '@/api/request';

export interface SmsConfig {
  provider: 'mock' | 'aliyun' | 'tencent';
  signName: string;
  templateCode: string;
  accessKey: string;
  accessSecret: string;
  devCode: string;
}

export function fetchSmsConfig() {
  return request.get<unknown, SmsConfig>('/admin/sms/config');
}

export function saveSmsConfig(data: Partial<SmsConfig>) {
  return request.put<unknown, SmsConfig>('/admin/sms/config', data);
}
