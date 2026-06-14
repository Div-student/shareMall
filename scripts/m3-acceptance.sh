#!/usr/bin/env bash
# M3-04 全链路验收：兑换 → 挂单 → 成交 → 提现
set -euo pipefail

BASE="${API_BASE:-http://localhost:3000/api}"
TS=$(date +%s)
SELLER_PHONE="137${TS: -8}"
BUYER_PHONE="136${TS: -8}"
PASSWORD="Test1234"
SMS="8888"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-admin123}"
PASS=0
FAIL=0
RESULTS=()

log() { echo "[$(date +%H:%M:%S)] $*"; }
pass() { PASS=$((PASS+1)); RESULTS+=("✅ $1"); log "PASS: $1"; }
fail() { FAIL=$((FAIL+1)); RESULTS+=("❌ $1"); log "FAIL: $1"; }

code() { echo "$1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('code',-1))"; }

admin_login() {
  local resp
  resp=$(curl -s -X POST "$BASE/admin/auth/login" -H 'Content-Type: application/json' \
    -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")
  if [[ "$(code "$resp")" != "0" ]]; then
    echo ""
    return 1
  fi
  echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])"
}

register_user() {
  local phone="$1"
  curl -s -X POST "$BASE/auth/sms" -H 'Content-Type: application/json' \
    -d "{\"phone\":\"$phone\",\"scene\":\"register\"}" > /dev/null
  local reg
  reg=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
    -d "{\"phone\":\"$phone\",\"password\":\"$PASSWORD\",\"smsCode\":\"$SMS\"}")
  if [[ "$(code "$reg")" != "0" ]]; then
    echo ""
    return 1
  fi
  echo "$reg" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])"
}

accrue_available() {
  local phone="$1" amount="$2" admin_auth="$3"
  curl -s -X POST "$BASE/admin/fund/accrue" -H "$admin_auth" -H 'Content-Type: application/json' \
    -d "{\"phone\":\"$phone\",\"amount\":$amount,\"assetType\":\"available_fund\",\"remark\":\"M3验收充值\"}"
}

submit_and_approve_kyc() {
  local auth="$1" phone="$2" admin_auth="$3"
  curl -s -X POST "$BASE/user/kyc" -H "$auth" -H 'Content-Type: application/json' \
    -d '{"realName":"张验收","idCardNo":"110101199001011234"}' > /dev/null
  local list kyc_id audit
  list=$(curl -s "$BASE/admin/kyc?status=pending&page=1&pageSize=20" -H "$admin_auth")
  kyc_id=$(echo "$list" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
for row in d.get('list',[]):
  if row.get('phone')=='$phone':
    print(row['id']); break
")
  if [[ -z "$kyc_id" || "$kyc_id" == "None" ]]; then
    return 1
  fi
  audit=$(curl -s -X POST "$BASE/admin/kyc/$kyc_id/audit" -H "$admin_auth" -H 'Content-Type: application/json' \
    -d '{"action":"pass"}')
  [[ "$(code "$audit")" == "0" ]]
}

log "=== M3-04 验收开始 ==="
log "API: $BASE"
log "卖家: $SELLER_PHONE | 买家: $BUYER_PHONE"

# 0. 健康检查
HEALTH=$(curl -s "$BASE/health" || echo '{}')
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  pass "0. 服务健康检查"
else
  fail "0. 服务健康检查 — 请先启动 server (pnpm dev:server)"
  printf '%s\n' "${RESULTS[@]}"
  exit 1
fi

ADMIN_TOKEN=$(admin_login) || { fail "0b. 后台登录失败 ($ADMIN_USER)"; printf '%s\n' "${RESULTS[@]}"; exit 1; }
ADMIN_AUTH="Authorization: Bearer $ADMIN_TOKEN"
pass "0b. 后台登录成功"

# 1. 注册卖家/买家
SELLER_TOKEN=$(register_user "$SELLER_PHONE") || { fail "1. 卖家注册失败"; printf '%s\n' "${RESULTS[@]}"; exit 1; }
BUYER_TOKEN=$(register_user "$BUYER_PHONE") || { fail "1. 买家注册失败"; printf '%s\n' "${RESULTS[@]}"; exit 1; }
SELLER_AUTH="Authorization: Bearer $SELLER_TOKEN"
BUYER_AUTH="Authorization: Bearer $BUYER_TOKEN"
pass "1. 卖家/买家注册成功"

# 2. 充值可用贡献金（覆盖动态成交价上限）
ACCRUE_S=$(accrue_available "$SELLER_PHONE" 500 "$ADMIN_AUTH")
ACCRUE_B=$(accrue_available "$BUYER_PHONE" 500 "$ADMIN_AUTH")
if [[ "$(code "$ACCRUE_S")" == "0" && "$(code "$ACCRUE_B")" == "0" ]]; then
  pass "2. 运营充值可用贡献金 500"
else
  fail "2. 运营充值失败"
fi

# 3. 获取可兑换藏品
MARKET=$(curl -s "$BASE/nft?page=1&pageSize=10")
NFT_ID=$(echo "$MARKET" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
lst=d.get('list',[])
print(lst[0]['id'] if lst else '')
")
DEAL_MAX=$(echo "$MARKET" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
lst=d.get('list',[])
print(lst[0].get('dealPriceMax', 999) if lst else 999)
")
if [[ -n "$NFT_ID" && "$NFT_ID" != "None" ]]; then
  pass "3. 获取藏品 (nftId=$NFT_ID dealPriceMax=$DEAL_MAX)"
else
  fail "3. 无可兑换藏品"; printf '%s\n' "${RESULTS[@]}"; exit 1
fi

# 4. 卖家兑换藏品
EX=$(curl -s -X POST "$BASE/nft/$NFT_ID/exchange" -H "$SELLER_AUTH")
DEAL_PRICE=$(echo "$EX" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('dealPrice',0))")
USER_NFT_ID=$(echo "$EX" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('userNftId',''))")
if [[ "$(code "$EX")" == "0" && -n "$USER_NFT_ID" && "$USER_NFT_ID" != "None" ]]; then
  pass "4. 卖家兑换藏品成功 (dealPrice=$DEAL_PRICE userNftId=$USER_NFT_ID)"
else
  fail "4. 兑换失败 — $(echo "$EX" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
  printf '%s\n' "${RESULTS[@]}"; exit 1
fi

FUND=$(curl -s "$BASE/fund/account" -H "$SELLER_AUTH")
HAS_EXCHANGE_RECORD=$(curl -s "$BASE/fund/records?page=1&pageSize=20" -H "$SELLER_AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
print('yes' if any(r.get('changeType')=='nft_exchange' for r in d.get('list',[])) else 'no')
")
if [[ "$HAS_EXCHANGE_RECORD" == "yes" ]]; then
  pass "4b. 兑换写入 nft_exchange 流水"
else
  fail "4b. 未找到 nft_exchange 流水"
fi

# 5. 实名认证（卖家/买家）
submit_and_approve_kyc "$SELLER_AUTH" "$SELLER_PHONE" "$ADMIN_AUTH" && pass "5. 卖家实名通过" || fail "5. 卖家实名审核失败"
submit_and_approve_kyc "$BUYER_AUTH" "$BUYER_PHONE" "$ADMIN_AUTH" && pass "5b. 买家实名通过" || fail "5b. 买家实名审核失败"

# 6. 卖家挂单
LISTING=$(curl -s -X POST "$BASE/nft/listings" -H "$SELLER_AUTH" -H 'Content-Type: application/json' \
  -d "{\"userNftId\":$USER_NFT_ID}")
LISTING_ID=$(echo "$LISTING" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('listingId',''))")
if [[ "$(code "$LISTING")" == "0" && -n "$LISTING_ID" && "$LISTING_ID" != "None" ]]; then
  pass "6. 卖家挂单成功 (listingId=$LISTING_ID)"
else
  fail "6. 挂单失败 — $(echo "$LISTING" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
  printf '%s\n' "${RESULTS[@]}"; exit 1
fi

# 7. 买家购买
CASH_BEFORE=$(curl -s "$BASE/fund/account" -H "$SELLER_AUTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('withdrawableCash',0))")
BUY=$(curl -s -X POST "$BASE/nft/trade/$LISTING_ID/buy" -H "$BUYER_AUTH")
TRADE_PRICE=$(echo "$BUY" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('price',0))")
SELLER_INCOME=$(echo "$BUY" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('sellerIncome',0))")
if [[ "$(code "$BUY")" == "0" ]]; then
  pass "7. 买家购买成交 (price=$TRADE_PRICE sellerIncome=$SELLER_INCOME)"
else
  fail "7. 购买失败 — $(echo "$BUY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
fi

# 8. 卖家提现金入账（不写贡献金明细）
CASH_AFTER=$(curl -s "$BASE/fund/account" -H "$SELLER_AUTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('withdrawableCash',0))")
python3 -c "import sys; sys.exit(0 if float('$CASH_AFTER') > float('$CASH_BEFORE') else 1)" && \
  pass "8. 卖家提现金增加 (before=$CASH_BEFORE after=$CASH_AFTER)" || \
  fail "8. 卖家提现金未增加 (before=$CASH_BEFORE after=$CASH_AFTER)"

NO_TRADE_INCOME_RECORD=$(curl -s "$BASE/fund/records?page=1&pageSize=50" -H "$SELLER_AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
print('yes' if not any(r.get('changeType')=='nft_trade_income' for r in d.get('list',[])) else 'no')
")
if [[ "$NO_TRADE_INCOME_RECORD" == "yes" ]]; then
  pass "8b. 卖家成交所得不在贡献金明细"
else
  fail "8b. 贡献金明细不应含 nft_trade_income"
fi

BUYER_HAS_TRADE_BUY=$(curl -s "$BASE/fund/records?page=1&pageSize=20" -H "$BUYER_AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
print('yes' if any(r.get('changeType')=='nft_trade_buy' for r in d.get('list',[])) else 'no')
")
if [[ "$BUYER_HAS_TRADE_BUY" == "yes" ]]; then
  pass "8c. 买家写入 nft_trade_buy 流水"
else
  fail "8c. 买家未找到 nft_trade_buy 流水"
fi

# 9. 卖家申请提现
WITHDRAW_AMT=$(python3 -c "import sys; print(min(float('$CASH_AFTER'), 10))")
WD=$(curl -s -X POST "$BASE/withdraw" -H "$SELLER_AUTH" -H 'Content-Type: application/json' \
  -d "{\"amount\":$WITHDRAW_AMT,\"method\":\"bank\",\"accountInfo\":{\"bankName\":\"验收银行\",\"cardNo\":\"6222021234567890\",\"accountName\":\"张验收\"}}")
if [[ "$(code "$WD")" != "0" ]]; then
  fail "9. 提现申请失败 — $(echo "$WD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
  WITHDRAW_ID=""
else
  WITHDRAW_ID=$(echo "$WD" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data') or {}; print(d.get('withdrawId', d.get('id','')))")
  if [[ -n "$WITHDRAW_ID" && "$WITHDRAW_ID" != "None" ]]; then
    pass "9. 卖家申请提现 (amount=$WITHDRAW_AMT id=$WITHDRAW_ID)"
  else
    fail "9. 提现申请响应缺少 id"
  fi
fi

# 10. 后台审核打款
if [[ -n "${WITHDRAW_ID:-}" && "$WITHDRAW_ID" != "None" ]]; then
  AUDIT=$(curl -s -X POST "$BASE/admin/withdraw/$WITHDRAW_ID/audit" -H "$ADMIN_AUTH" -H 'Content-Type: application/json' \
    -d '{"action":"pass"}')
  if [[ "$(code "$AUDIT")" == "0" ]]; then
    pass "10. 后台提现审核通过"
  else
    fail "10. 提现审核失败 — $(echo "$AUDIT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")"
  fi

  WD_STATUS=$(curl -s "$BASE/withdraw/records?page=1" -H "$SELLER_AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
lst=d.get('list',[])
print(lst[0]['status'] if lst else '')
")
  if [[ "$WD_STATUS" == "paid" ]]; then
    pass "10b. 提现记录状态为 paid"
  else
    fail "10b. 提现状态应为 paid (got $WD_STATUS)"
  fi
else
  fail "10. 提现审核跳过"
  fail "10b. 提现状态跳过"
fi

log ""
log "=== 验收汇总 (通过 $PASS / 失败 $FAIL) ==="
printf '%s\n' "${RESULTS[@]}"
log "卖家: $SELLER_PHONE / 买家: $BUYER_PHONE / 密码: $PASSWORD"

if [[ "$FAIL" -eq 0 ]]; then
  log "M3-04 验收: 全部通过"
  exit 0
else
  log "M3-04 验收: 存在失败项"
  exit 1
fi
