#!/usr/bin/env bash
# M4 验收：M4-01 搜索/分类 + M4-02 评价/消息 + M4-03 报表/对账
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
data() { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('data',d), ensure_ascii=False))"; }

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

log "=== M4 验收开始 ==="
log "API: $BASE"

# --- M4-01 ---
HEALTH=$(curl -s "$BASE/health" || echo '{}')
if echo "$HEALTH" | grep -q '"status":"ok"'; then pass "M4-01.0 服务健康检查"
else fail "M4-01.0 服务健康检查"; printf '%s\n' "${RESULTS[@]}"; exit 1; fi

CATS=$(curl -s "$BASE/categories")
if [[ "$(code "$CATS")" == "0" ]]; then pass "M4-01.1 GET /categories"
else fail "M4-01.1 GET /categories"; fi

SEARCH=$(curl -s -G "$BASE/products" --data-urlencode "keyword=蓝牙" --data-urlencode "page=1" --data-urlencode "pageSize=10")
if [[ "$(code "$SEARCH")" == "0" ]]; then pass "M4-01.2 GET /products?keyword="
else fail "M4-01.2 GET /products?keyword="; fi

# --- M4-02 ---
log "--- M4-02 评价/消息 ---"
ADMIN_TOKEN=$(admin_login || true)
USER_TOKEN=$(register_user "$PHONE" || true)
if [[ -z "$USER_TOKEN" ]]; then
  fail "M4-02.0 注册用户"
else
  pass "M4-02.0 注册用户"
  AUTH="Authorization: Bearer $USER_TOKEN"

  # 消息列表（初始可能为空）
  MSGS=$(curl -s "$BASE/messages" -H "$AUTH")
  if [[ "$(code "$MSGS")" == "0" ]]; then pass "M4-02.1 GET /messages"
  else fail "M4-02.1 GET /messages"; fi

  UNREAD=$(curl -s "$BASE/messages/unread-count" -H "$AUTH")
  if [[ "$(code "$UNREAD")" == "0" ]]; then pass "M4-02.2 GET /messages/unread-count"
  else fail "M4-02.2 GET /messages/unread-count"; fi

  # 找已完成订单或走完整链路
  ORDERS=$(curl -s "$BASE/orders?status=completed" -H "$AUTH")
  ORDER_ID=$(echo "$ORDERS" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('list',[{}])[0].get('id','') if d.get('list') else '')" 2>/dev/null || echo "")

  if [[ -z "$ORDER_ID" || "$ORDER_ID" == "None" ]]; then
    # 简化链路：下单支付发货收货
    HOME=$(curl -s "$BASE/home")
    SKU=$(curl -s "$BASE/products" | python3 -c "
import sys,json
d=json.load(sys.stdin).get('data',{})
print(d.get('list',[{}])[0].get('id',''))
" 2>/dev/null || echo "")
    PRODUCT_ID="$SKU"
    DETAIL=$(curl -s "$BASE/products/$PRODUCT_ID")
    SKU_ID=$(echo "$DETAIL" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',{}); print(d.get('skus',[{}])[0].get('id',''))" 2>/dev/null || echo "")

    ADDR=$(curl -s -X POST "$BASE/user/address" -H "$AUTH" -H 'Content-Type: application/json' \
      -d '{"receiver":"测试","phone":"13900000001","province":"北京","city":"北京","district":"朝阳","detail":"测试路1号","isDefault":true}')
    ADDR_ID=$(echo "$ADDR" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('id',''))" 2>/dev/null || echo "")

    if [[ -n "$SKU_ID" && -n "$ADDR_ID" && "$ADDR_ID" != "None" ]]; then
      CREATE=$(curl -s -X POST "$BASE/orders" -H "$AUTH" -H 'Content-Type: application/json' \
        -d "{\"items\":[{\"skuId\":$SKU_ID,\"quantity\":1}],\"addressId\":$ADDR_ID}")
      ORDER_ID=$(echo "$CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('orderId',''))" 2>/dev/null || echo "")
      if [[ -n "$ORDER_ID" && "$ORDER_ID" != "None" ]]; then
        curl -s -X POST "$BASE/orders/$ORDER_ID/pay" -H "$AUTH" -H 'Content-Type: application/json' -d '{"channel":"wechat"}' > /dev/null
        if [[ -n "$ADMIN_TOKEN" ]]; then
          curl -s -X POST "$BASE/admin/orders/$ORDER_ID/ship" -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
        fi
        curl -s -X POST "$BASE/orders/$ORDER_ID/receive" -H "$AUTH" > /dev/null
      fi
    fi
  fi

  if [[ -n "$ORDER_ID" && "$ORDER_ID" != "None" ]]; then
    REV=$(curl -s -X POST "$BASE/orders/$ORDER_ID/review" -H "$AUTH" -H 'Content-Type: application/json' \
      -d '{"rating":5,"content":"M4验收评价","isAnonymous":false}')
    if [[ "$(code "$REV")" == "0" ]]; then pass "M4-02.3 POST /orders/:id/review"
    else fail "M4-02.3 POST /orders/:id/review"; fi

    CHECK=$(curl -s "$BASE/orders/$ORDER_ID/review" -H "$AUTH")
    REVIEWED=$(echo "$CHECK" | python3 -c "import sys,json; print('yes' if json.load(sys.stdin).get('data',{}).get('reviewed') else 'no')" 2>/dev/null || echo "no")
    if [[ "$REVIEWED" == "yes" ]]; then pass "M4-02.4 GET /orders/:id/review — reviewed"
    else fail "M4-02.4 GET /orders/:id/review"; fi

    MSGS2=$(curl -s "$BASE/messages?type=order" -H "$AUTH")
    MCOUNT=$(echo "$MSGS2" | python3 -c "import sys,json; print(json.load(sys.stdin).get('data',{}).get('total',0))" 2>/dev/null || echo "0")
    if [[ "$MCOUNT" -ge 1 ]]; then pass "M4-02.5 订单消息通知 total=$MCOUNT"
    else fail "M4-02.5 订单消息通知（发货/完成）"; fi
  else
    fail "M4-02.3~5 无已完成订单，跳过评价/消息链路"
  fi

  if [[ -n "$ADMIN_TOKEN" ]]; then
    AREV=$(curl -s "$BASE/admin/reviews" -H "Authorization: Bearer $ADMIN_TOKEN")
    if [[ "$(code "$AREV")" == "0" ]]; then pass "M4-02.6 GET /admin/reviews"
    else fail "M4-02.6 GET /admin/reviews"; fi
  else
    fail "M4-02.6 后台登录失败，跳过评价管理"
  fi
fi

# --- M4-03 ---
log "--- M4-03 报表/对账 ---"
if [[ -n "$ADMIN_TOKEN" ]]; then
  FLOW=$(curl -s "$BASE/admin/finance/flow?category=fund&page=1&pageSize=5" -H "Authorization: Bearer $ADMIN_TOKEN")
  if [[ "$(code "$FLOW")" == "0" ]]; then pass "M4-03.1 GET /admin/finance/flow"
  else fail "M4-03.1 GET /admin/finance/flow"; fi

  REPORT=$(curl -s "$BASE/admin/finance/reports?type=trade" -H "Authorization: Bearer $ADMIN_TOKEN")
  if [[ "$(code "$REPORT")" == "0" ]]; then pass "M4-03.2 GET /admin/finance/reports"
  else fail "M4-03.2 GET /admin/finance/reports"; fi

  RECON=$(curl -s "$BASE/admin/finance/reconcile" -H "Authorization: Bearer $ADMIN_TOKEN")
  if [[ "$(code "$RECON")" == "0" ]]; then pass "M4-03.3 GET /admin/finance/reconcile"
  else fail "M4-03.3 GET /admin/finance/reconcile"; fi

  ITEMS=$(echo "$RECON" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',{}).get('items',[])))" 2>/dev/null || echo "0")
  if [[ "$ITEMS" -ge 3 ]]; then pass "M4-03.4 对账项 items=$ITEMS"
  else fail "M4-03.4 对账项不足"; fi
else
  fail "M4-03 后台登录失败，跳过报表/对账"
fi

log ""
log "=== M4 验收结果: ${PASS} 通过 / ${FAIL} 失败 ==="
printf '%s\n' "${RESULTS[@]}"
[[ "$FAIL" -eq 0 ]]
