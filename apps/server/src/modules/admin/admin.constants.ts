export const ADMIN_PERMISSION_OPTIONS = [
  { key: 'dashboard:view', label: '数据看板' },
  { key: 'product:manage', label: '商品管理' },
  { key: 'order:manage', label: '订单管理' },
  { key: 'aftersale:manage', label: '售后管理' },
  { key: 'review:manage', label: '评价管理' },
  { key: 'user:view', label: '用户管理' },
  { key: 'kyc:audit', label: '实名审核' },
  { key: 'fund:config', label: '贡献金配置' },
  { key: 'withdraw:audit', label: '提现审核' },
  { key: 'finance:view', label: '财务报表' },
  { key: 'coupon:manage', label: '优惠券管理' },
  { key: 'campaign:manage', label: '活动管理' },
  { key: 'dict:manage', label: '字典管理' },
  { key: 'service:config', label: '客服配置' },
  { key: 'order-feed:config', label: '下单动态配置' },
  { key: 'notification:manage', label: '站内通知' },
  { key: 'checkin:monitor', label: '打卡监控' },
  { key: 'nft:manage', label: '藏品管理' },
  { key: 'role:manage', label: '角色管理' },
  { key: 'account:manage', label: '账号管理' },
  { key: 'log:view', label: '操作日志' },
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSION_OPTIONS)[number]['key'];

export const ALL_ADMIN_PERMISSIONS = ADMIN_PERMISSION_OPTIONS.map((item) => item.key);

export function normalizeAdminPath(path: string) {
  if (path.startsWith('/api/admin')) return path;
  if (path.startsWith('/admin')) return `/api${path}`;
  return path;
}

export function isPublicAdminPath(path: string) {
  return normalizeAdminPath(path).startsWith('/api/admin/auth/login');
}

export function resolveAdminPermission(path: string): AdminPermission | null {
  const normalized = normalizeAdminPath(path);
  if (isPublicAdminPath(normalized)) return null;
  if (normalized.startsWith('/api/admin/auth/profile')) return null;
  if (normalized.startsWith('/api/admin/dashboard')) return 'dashboard:view';
  if (normalized.startsWith('/api/admin/products') || normalized.includes('/admin/categories')) return 'product:manage';
  if (normalized.startsWith('/api/admin/orders')) return 'order:manage';
  if (normalized.startsWith('/api/admin/aftersale')) return 'aftersale:manage';
  if (normalized.startsWith('/api/admin/reviews')) return 'review:manage';
  if (normalized.startsWith('/api/admin/kyc')) return 'kyc:audit';
  if (normalized.startsWith('/api/admin/finance')) return 'finance:view';
  if (normalized.startsWith('/api/admin/coupons')) return 'coupon:manage';
  if (normalized.startsWith('/api/admin/campaigns')) return 'campaign:manage';
  if (normalized.startsWith('/api/admin/dicts')) return 'dict:manage';
  if (normalized.startsWith('/api/admin/service-config')) return 'service:config';
  if (normalized.startsWith('/api/admin/order-feed')) return 'order-feed:config';
  if (normalized.startsWith('/api/admin/notifications')) return 'notification:manage';
  if (normalized.includes('/admin/fund/checkin-monitor')) return 'checkin:monitor';
  if (normalized.startsWith('/api/admin/fund')) return 'fund:config';
  if (normalized.startsWith('/api/admin/withdraw')) return 'withdraw:audit';
  if (normalized.startsWith('/api/admin/nft')) return 'nft:manage';
  if (normalized.startsWith('/api/admin/roles')) return 'role:manage';
  if (normalized.startsWith('/api/admin/accounts')) return 'account:manage';
  if (normalized.startsWith('/api/admin/logs')) return 'log:view';
  if (normalized.startsWith('/api/admin')) return 'dashboard:view';
  return null;
}

export function hasPermission(permissions: string[] | null | undefined, required: string) {
  if (!permissions?.length) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(required);
}
