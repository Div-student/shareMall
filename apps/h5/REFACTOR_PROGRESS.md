# H5 购物流程 UI 重构进展

> 对照 Open Design shareMall 原型，接口保持不变。

| 阶段 | 任务 | 状态 | 更新时间 |
|------|------|------|----------|
| Phase 0.1 | 设计 Token（sharemall-tokens.css / sharemall-shop.css） | ✅ 完成 | 2026-06-16 |
| Phase 0.2 | 共享组件 `components/shop/*`（11 个） | ✅ 完成 | 2026-06-16 |
| Phase 0.3 | TabBar 改为首页/分类/购物车/我的，贡献金入口迁至 Mine | ✅ 完成 | 2026-06-16 |
| Phase 1 | 首页 Home.vue | ✅ 完成 | 2026-06-16 |
| Phase 2 | 商品详情 ProductDetail.vue + SKU 弹层 | ✅ 完成 | 2026-06-16 |
| Phase 3 | 购物车 Cart.vue | ✅ 完成 | 2026-06-16 |
| Phase 4 | 确认订单 OrderConfirm.vue | ✅ 完成 | 2026-06-16 |
| Phase 5 | 收银台 Pay.vue | ✅ 完成 | 2026-06-16 |
| Phase 6 | 支付结果 PayResult.vue | ✅ 完成 | 2026-06-16 |
| Phase 7 | 分类 Category.vue / 搜索 Search.vue 视觉统一 | ✅ 完成 | 2026-06-16 |

## 验收链路

首页 → 商品详情 → 加购/SKU → 购物车 → 确认订单 → 支付 → 支付结果

## 主要改动文件

- 新增：`styles/sharemall-tokens.css`、`styles/sharemall-shop.css`、`components/shop/*`
- 修改：`App.vue`、`router/index.ts`、`views/home|product|cart|order/*`、`views/category|search`、`views/mine/Mine.vue`
- 未改：`api/*.ts` 接口契约
