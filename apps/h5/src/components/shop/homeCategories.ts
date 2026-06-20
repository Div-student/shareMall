/** 首页金刚区 — 与 Open Design home.html 一致 */
export interface HomeCategoryItem {
  id: number;
  name: string;
  color: string;
  icon: 'star' | 'digital' | 'home' | 'beauty' | 'food' | 'fashion' | 'baby' | 'sport' | 'jewelry' | 'more';
}

export const HOME_CATEGORIES: HomeCategoryItem[] = [
  { id: 1, name: '新品推荐', color: '#c96442', icon: 'star' },
  { id: 2, name: '数码电子', color: '#3b82f6', icon: 'digital' },
  { id: 3, name: '家居生活', color: '#f59e0b', icon: 'home' },
  { id: 4, name: '美妆个护', color: '#ec4899', icon: 'beauty' },
  { id: 5, name: '食品饮料', color: '#22c55e', icon: 'food' },
  { id: 6, name: '服饰鞋包', color: '#8b5cf6', icon: 'fashion' },
  { id: 7, name: '母婴用品', color: '#f97316', icon: 'baby' },
  { id: 8, name: '运动户外', color: '#06b6d4', icon: 'sport' },
  { id: 9, name: '金饰珠宝', color: '#eab308', icon: 'jewelry' },
  { id: 10, name: '更多分类', color: 'var(--muted)', icon: 'more' },
];
