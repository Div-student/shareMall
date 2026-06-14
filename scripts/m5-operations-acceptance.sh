#!/usr/bin/env bash
# P2 运营验收：优惠券、活动、字典、客服配置
set -euo pipefail

BASE="${API_BASE:-http://localhost:3000/api}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-admin123}"
PHONE="138$(date +%s | tail -c 9)"
PASSWORD="Test1234"
SMS="8888"
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
  if [[ "$(code "$resp")" != "0" ]]; then echo ""; return 1; fi
  echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])"
}

register_user() {
  local phone="$1"
  curl -s -X POST "$BASE/auth/sms" -H 'Content-Type: application/json' \
    -d "{\"phone\":\"$phone\",\"scene\":\"register\"}" > /dev/null
  local reg
  reg=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
    -d "{\"phone\":\"$phone\",\"password\":\"$PASSWORD\",\"smsCode\":\"$SMS\"}")
  if [[ "$(code "$reg")" != "0" ]]; then echo ""; return 1; fi
  echo "$reg" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])"
}

log "=== P2 运营验收开始 ==="
ADMIN_TOKEN=$(admin_login || true)
USER_TOKEN=$(register_user "$PHONE" || true)

if [[ -z "$ADMIN_TOKEN" ]]; then
  fail "后台登录"
  printf '%s\n' "${RESULTS[@]}"; exit 1
else
  pass "后台登录"
fi

AUTH="Authorization: Bearer $ADMIN_TOKEN"

COUPONS=$(curl -s "$BASE/admin/coupons" -H "$AUTH")
if [[ "$(code "$COUPONS")" == "0" ]]; then pass "GET /admin/coupons"
else fail "GET /admin/coupons"; fi

CAMPAIGNS=$(curl -s "$BASE/admin/campaigns" -H "$AUTH")
if [[ "$(code "$CAMPAIGNS")" == "0" ]]; then pass "GET /admin/campaigns"
else fail "GET /admin/campaigns"; fi

DICTS=$(curl -s "$BASE/admin/dicts?group=order_status" -H "$AUTH")
if [[ "$(code "$DICTS")" == "0" ]]; then pass "GET /admin/dicts"
else fail "GET /admin/dicts"; fi

SERVICE=$(curl -s "$BASE/admin/service-config" -H "$AUTH")
if [[ "$(code "$SERVICE")" == "0" ]]; then pass "GET /admin/service-config"
else fail "GET /admin/service-config"; fi

PUB_SERVICE=$(curl -s "$BASE/service-config")
if [[ "$(code "$PUB_SERVICE")" == "0" ]]; then pass "GET /service-config"
else fail "GET /service-config"; fi

PUB_DICT=$(curl -s "$BASE/dicts/order_status")
if [[ "$(code "$PUB_DICT")" == "0" ]]; then pass "GET /dicts/order_status"
else fail "GET /dicts/order_status"; fi

if [[ -n "$USER_TOKEN" ]]; then
  UAUTH="Authorization: Bearer $USER_TOKEN"
  CLAIMABLE=$(curl -s "$BASE/coupons/claimable" -H "$UAUTH")
  if [[ "$(code "$CLAIMABLE")" == "0" ]]; then pass "GET /coupons/claimable"
  else fail "GET /coupons/claimable"; fi

  COUPON_ID=$(echo "$CLAIMABLE" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('list',[{}])[0].get('id',''))" 2>/dev/null || echo "")
  if [[ -n "$COUPON_ID" && "$COUPON_ID" != "None" ]]; then
    CLAIM=$(curl -s -X POST "$BASE/coupons/$COUPON_ID/claim" -H "$UAUTH")
    if [[ "$(code "$CLAIM")" == "0" ]]; then pass "POST /coupons/:id/claim"
    else fail "POST /coupons/:id/claim"; fi
  else
    fail "无可领优惠券"
  fi
else
  fail "用户注册失败"
fi

# --- P2 扩展 ---
log "--- P2 扩展：动态/通知/打卡 ---"
FEED_CFG=$(curl -s "$BASE/admin/order-feed" -H "$AUTH")
if [[ "$(code "$FEED_CFG")" == "0" ]]; then pass "GET /admin/order-feed"
else fail "GET /admin/order-feed"; fi

NOTIFY=$(curl -s "$BASE/admin/notifications?page=1" -H "$AUTH")
if [[ "$(code "$NOTIFY")" == "0" ]]; then pass "GET /admin/notifications"
else fail "GET /admin/notifications"; fi

MONITOR=$(curl -s "$BASE/admin/fund/checkin-monitor" -H "$AUTH")
if [[ "$(code "$MONITOR")" == "0" ]]; then pass "GET /admin/fund/checkin-monitor"
else fail "GET /admin/fund/checkin-monitor"; fi

PRODUCT_ID=$(curl -s "$BASE/products" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('list',[{}])[0].get('id',''))" 2>/dev/null || echo "")
if [[ -n "$PRODUCT_ID" && "$PRODUCT_ID" != "None" ]]; then
  OF=$(curl -s "$BASE/products/$PRODUCT_ID/order-feed")
  if [[ "$(code "$OF")" == "0" ]]; then pass "GET /products/:id/order-feed"
  else fail "GET /products/:id/order-feed"; fi
else
  fail "无商品，跳过 order-feed"
fi

log ""
log "=== P2 运营验收: ${PASS} 通过 / ${FAIL} 失败 ==="
printf '%s\n' "${RESULTS[@]}"
[[ "$FAIL" -eq 0 ]]
