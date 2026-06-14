#!/usr/bin/env bash
# M1-15 全链路验收脚本
set -euo pipefail

BASE="${API_BASE:-http://localhost:3000/api}"
PHONE="139$(date +%s | tail -c 9)"
PASSWORD="Test1234"
SMS="8888"
PASS=0
FAIL=0
RESULTS=()

log() { echo "[$(date +%H:%M:%S)] $*"; }
pass() { PASS=$((PASS+1)); RESULTS+=("✅ $1"); log "PASS: $1"; }
fail() { FAIL=$((FAIL+1)); RESULTS+=("❌ $1"); log "FAIL: $1"; }

# 响应体取 data 字段
data() { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('data',d), ensure_ascii=False))"; }
code() { echo "$1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('code',-1))"; }

log "=== M1-15 验收开始 ==="
log "API: $BASE | 测试账号: $PHONE"

# 0. 健康检查
HEALTH=$(curl -s "$BASE/health" || echo '{}')
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  pass "0. 服务健康检查"
else
  fail "0. 服务健康检查 — 请先启动 server (pnpm dev:server)"
  printf '%s\n' "${RESULTS[@]}"
  exit 1
fi

# 1. 注册
curl -s -X POST "$BASE/auth/sms" -H 'Content-Type: application/json' \
  -d "{\"phone\":\"$PHONE\",\"scene\":\"register\"}" > /dev/null
REG=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d "{\"phone\":\"$PHONE\",\"password\":\"$PASSWORD\",\"smsCode\":\"$SMS\"}")
if [[ "$(code "$REG")" == "0" ]]; then
  TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
  pass "1. 注册成功，三类资产归零"
else
  fail "1. 注册 — $(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
  printf '%s\n' "${RESULTS[@]}"; exit 1
fi
AUTH="Authorization: Bearer $TOKEN"

FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
P0=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['pendingFund'])")
A0=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['availableFund'])")
if [[ "$P0" == "0" || "$P0" == "0.0" || "$P0" == "0.00" ]] && [[ "$A0" == "0" || "$A0" == "0.0" || "$A0" == "0.00" ]]; then
  pass "1b. 新用户 fund_account 三类资产为 0"
else
  fail "1b. 新用户资产应为 0 (pending=$P0 available=$A0)"
fi

# 2. 商品 & SKU
HOME=$(curl -s "$BASE/home")
PRODUCT_ID=$(echo "$HOME" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['products'][0]['id'])")
DETAIL=$(curl -s "$BASE/products/$PRODUCT_ID")
SKU_ID=$(echo "$DETAIL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['skus'][0]['id'])")
PRICE=$(echo "$DETAIL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['price'])")
if [[ -n "$SKU_ID" && "$SKU_ID" != "None" ]]; then
  pass "2. 获取商品/SKU (product=$PRODUCT_ID sku=$SKU_ID price=$PRICE)"
else
  fail "2. 无法获取商品 SKU"; printf '%s\n' "${RESULTS[@]}"; exit 1
fi

# 3. 收货地址
ADDR=$(curl -s -X POST "$BASE/user/address" -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"receiver":"验收员","phone":"13800138000","province":"广东省","city":"深圳市","district":"南山区","detail":"科技园路1号"}')
ADDRESS_ID=$(echo "$ADDR" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['id'])")
if [[ -n "$ADDRESS_ID" && "$ADDRESS_ID" != "None" ]]; then
  pass "3. 新增收货地址 (id=$ADDRESS_ID)"
else
  fail "3. 新增收货地址失败"
fi

# 4. 下单试算
PREVIEW=$(curl -s -X POST "$BASE/orders/preview" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"items\":[{\"skuId\":$SKU_ID,\"quantity\":1}],\"addressId\":$ADDRESS_ID,\"useFund\":false}")
ACCRUED=$(echo "$PREVIEW" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['accruedFund'])")
PAY_AMT=$(echo "$PREVIEW" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['payAmount'])")
if python3 -c "import sys; sys.exit(0 if float('$ACCRUED')>0 else 1)"; then
  pass "4. 下单试算 accruedFund=$ACCRUED payAmount=$PAY_AMT"
else
  fail "4. 下单试算预计贡献金应 > 0"
fi

# 5. 创建订单
ORDER=$(curl -s -X POST "$BASE/orders" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"items\":[{\"skuId\":$SKU_ID,\"quantity\":1}],\"addressId\":$ADDRESS_ID,\"useFund\":false}")
ORDER_ID=$(echo "$ORDER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['orderId'])")
if [[ -n "$ORDER_ID" && "$ORDER_ID" != "None" ]]; then
  pass "5. 创建订单 (orderId=$ORDER_ID)"
else
  fail "5. 创建订单失败"; printf '%s\n' "${RESULTS[@]}"; exit 1
fi

# 6. 支付前资产不变
FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
P_BEFORE=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['pendingFund'])")
if [[ "$P_BEFORE" == "$P0" || "$P_BEFORE" == "0" || "$P_BEFORE" == "0.0" ]]; then
  pass "6. 创建订单后待兑现贡献金未入账 (pending=$P_BEFORE)"
else
  fail "6. 创建订单后 pending 不应增加 (pending=$P_BEFORE)"
fi

# 7. Mock 支付
PAY=$(curl -s -X POST "$BASE/orders/$ORDER_ID/pay" -H "$AUTH" -H 'Content-Type: application/json' -d '{"channel":"wechat"}')
if [[ "$(code "$PAY")" == "0" ]]; then
  pass "7. Mock 支付成功"
else
  fail "7. Mock 支付失败"
fi

FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
P_AFTER_PAY=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['pendingFund'])")
if [[ "$P_AFTER_PAY" == "$P0" || "$P_AFTER_PAY" == "0" || "$P_AFTER_PAY" == "0.0" ]]; then
  pass "7b. 支付成功后待兑现贡献金仍未入账 (pending=$P_AFTER_PAY)"
else
  fail "7b. 支付后 pending 不应增加 (pending=$P_AFTER_PAY)"
fi

# 8. 后台发货（需后台登录）
ADMIN_LOGIN=$(curl -s -X POST "$BASE/admin/auth/login" -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token','') if d.get('code')==0 else '')" 2>/dev/null || echo "")
ADMIN_AUTH=""
if [[ -n "$ADMIN_TOKEN" ]]; then
  ADMIN_AUTH="Authorization: Bearer $ADMIN_TOKEN"
fi

SHIP=$(curl -s -X POST "$BASE/admin/orders/$ORDER_ID/ship" -H 'Content-Type: application/json' ${ADMIN_AUTH:+-H "$ADMIN_AUTH"})
if [[ "$(code "$SHIP")" == "0" ]]; then
  pass "8. 后台发货成功"
else
  fail "8. 后台发货失败 — $(echo "$SHIP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
fi

DETAIL_ORDER=$(curl -s "$BASE/orders/$ORDER_ID" -H "$AUTH")
STATUS=$(echo "$DETAIL_ORDER" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['status'])")
if [[ "$STATUS" == "shipped" ]]; then
  pass "8b. 订单状态变为 shipped"
else
  fail "8b. 订单状态应为 shipped (got $STATUS)"
fi

# 9. 确认收货
RECV=$(curl -s -X POST "$BASE/orders/$ORDER_ID/receive" -H "$AUTH")
RECV_FUND=$(echo "$RECV" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('accruedFund',0))")
if [[ "$(code "$RECV")" == "0" ]]; then
  pass "9. 确认收货成功 accruedFund=$RECV_FUND"
else
  fail "9. 确认收货失败"
fi

FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
P_AFTER_RECV=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['pendingFund'])")
python3 -c "import sys; sys.exit(0 if float('$P_AFTER_RECV') >= float('$ACCRUED') else 1)" && \
  pass "9b. 确认收货后待兑现贡献金入账 (pending=$P_AFTER_RECV)" || \
  fail "9b. 确认收货后 pending 应 >= $ACCRUED (got $P_AFTER_RECV)"

# 10. 流水校验
RECORDS=$(curl -s "$BASE/fund/records?assetType=pending_fund" -H "$AUTH")
HAS_ACCRUE=$(echo "$RECORDS" | python3 -c "
import sys,json
raw=json.load(sys.stdin)
d=raw.get('data', raw)
found=any(r.get('changeType')=='order_accrue' and '确认收货' in (r.get('remark') or '') for r in d.get('list',[]))
print('yes' if found else 'no')
")
if [[ "$HAS_ACCRUE" == "yes" ]]; then
  pass "10. fund_record 含「确认收货累计」流水"
else
  fail "10. 未找到确认收货贡献金流水"
fi

# 11. 补足至 90 档（单商品贡献金约 10~30，开发环境用 admin 充值）
FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
P_TIER=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['pendingFund'])")
if python3 -c "import sys; sys.exit(0 if float('$P_TIER') >= 90 else 1)"; then
  pass "11. 待兑现已达 90 档 (pending=$P_TIER)"
else
  TOPUP=$(python3 -c "import sys; print(round(90 - float('$P_TIER') + 0.01, 2))")
  ACCRUE=$(curl -s -X POST "$BASE/admin/fund/accrue" -H 'Content-Type: application/json' ${ADMIN_AUTH:+-H "$ADMIN_AUTH"} \
    -d "{\"phone\":\"$PHONE\",\"amount\":$TOPUP,\"remark\":\"验收补足至90档\"}")
  FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
  P_TIER=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['pendingFund'])")
  if [[ "$(code "$ACCRUE")" == "0" ]] && python3 -c "import sys; sys.exit(0 if float('$P_TIER') >= 90 else 1)"; then
    pass "11. 运营充值补足待兑现至 90 档 (pending=$P_TIER)"
  else
    fail "11. 运营充值后 pending 仍不足 90 (pending=$P_TIER)"
  fi
fi

# 12. 开启打卡
START=$(curl -s -X POST "$BASE/fund/checkin/start" -H "$AUTH" -H 'Content-Type: application/json' -d '{"tier":90}')
PLAN_ID=$(echo "$START" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('planId', d.get('id','')))" 2>/dev/null || echo "")
if [[ "$(code "$START")" == "0" && -n "$PLAN_ID" && "$PLAN_ID" != "None" ]]; then
  pass "12. 开启 90 档打卡计划 (planId=$PLAN_ID)"
else
  fail "12. 开启打卡失败 — $(echo "$START" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
  PLAN_ID=""
fi

# 13. 每日打卡
if [[ -n "$PLAN_ID" ]]; then
  SIGN=$(curl -s -X POST "$BASE/fund/checkin/sign" -H "$AUTH" -H 'Content-Type: application/json' -d "{\"planId\":$PLAN_ID}")
  if [[ "$(code "$SIGN")" == "0" ]]; then
    pass "13. 每日打卡签到成功"
  else
    fail "13. 打卡签到失败 — $(echo "$SIGN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
  fi
else
  fail "13. 打卡签到跳过（无有效 planId）"
fi

FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
A_AFTER_SIGN=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['availableFund'])")
python3 -c "import sys; sys.exit(0 if float('$A_AFTER_SIGN')>0 else 1)" && \
  pass "13b. 打卡后可用贡献金增加 (available=$A_AFTER_SIGN)" || \
  fail "13b. 打卡后 available 应 > 0 (got $A_AFTER_SIGN)"

# 14. 二次下单抵扣
if python3 -c "import sys; sys.exit(0 if float('$A_AFTER_SIGN')>0 else 1)" 2>/dev/null; then
  PREVIEW2=$(curl -s -X POST "$BASE/orders/preview" -H "$AUTH" -H 'Content-Type: application/json' \
    -d "{\"items\":[{\"skuId\":$SKU_ID,\"quantity\":1}],\"addressId\":$ADDRESS_ID,\"useFund\":true}")
  DEDUCT=$(echo "$PREVIEW2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['fundDeductAmount'])")
  PAY2=$(echo "$PREVIEW2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['payAmount'])")
  python3 -c "import sys; sys.exit(0 if float('$DEDUCT')>0 else 1)" && \
    pass "14. 二次下单试算贡献金抵扣 fundDeduct=$DEDUCT payAmount=$PAY2" || \
    fail "14. 二次下单应可使用贡献金抵扣"

  ORDER2=$(curl -s -X POST "$BASE/orders" -H "$AUTH" -H 'Content-Type: application/json' \
    -d "{\"items\":[{\"skuId\":$SKU_ID,\"quantity\":1}],\"addressId\":$ADDRESS_ID,\"useFund\":true}")
  ORDER2_ID=$(echo "$ORDER2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['orderId'])")
  if [[ -n "$ORDER2_ID" && "$ORDER2_ID" != "None" ]]; then
    pass "15. 创建抵扣订单成功 (orderId=$ORDER2_ID)"
  else
    fail "15. 创建抵扣订单失败"
  fi

  FUND=$(curl -s "$BASE/fund/account" -H "$AUTH")
  A_AFTER_DEDUCT=$(echo "$FUND" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d)['availableFund'])")
  python3 -c "import sys; sys.exit(0 if float('$A_AFTER_DEDUCT') < float('$A_AFTER_SIGN') else 1)" && \
    pass "15b. 创建订单后可用贡献金已扣减 (available=$A_AFTER_DEDUCT)" || \
    fail "15b. 抵扣后 available 应减少 (before=$A_AFTER_SIGN after=$A_AFTER_DEDUCT)"
else
  fail "14. 二次下单抵扣跳过（无可用贡献金）"
  fail "15. 创建抵扣订单跳过"
  fail "15b. 抵扣扣减跳过"
fi

log ""
log "=== 验收汇总 (通过 $PASS / 失败 $FAIL) ==="
printf '%s\n' "${RESULTS[@]}"
log "测试账号: $PHONE / $PASSWORD"

if [[ "$FAIL" -eq 0 ]]; then
  log "M1-15 验收: 全部通过"
  exit 0
else
  log "M1-15 验收: 存在失败项"
  exit 1
fi
