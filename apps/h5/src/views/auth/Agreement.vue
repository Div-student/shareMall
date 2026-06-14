<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const type = computed(() => String(route.params.type ?? 'user'));

const titleMap: Record<string, string> = {
  user: '用户服务协议',
  privacy: '隐私政策',
};

const contentMap: Record<string, string> = {
  user: `欢迎使用 shareMall 平台服务。请您仔细阅读本协议，注册或使用本平台即表示您同意以下条款：

1. 账号注册与安全
您应使用真实手机号注册账号，妥善保管密码与验证码，不得将账号出借、转让给他人。

2. 商品交易
您在平台下单、支付、收货、评价等行为应遵守国家法律法规及平台规则。商品价格、库存、贡献金规则以页面展示及订单快照为准。

3. 贡献金与数字藏品
贡献金、打卡兑现、数字藏品兑换及二级市场交易规则以平台公示的业务说明为准，相关资产仅限平台内按规则使用。

4. 违规处理
如您存在虚假交易、恶意套现、发布违法信息等行为，平台有权限制账号功能、冻结资产或终止服务。

5. 协议变更
平台可根据业务需要更新本协议，更新后将通过站内通知等方式提示，继续使用视为接受更新后的协议。`,
  privacy: `shareMall 重视您的个人信息保护。本政策说明我们如何收集、使用与保护您的信息：

1. 信息收集
为完成注册、登录、下单、实名认证、提现等服务，我们可能收集手机号、昵称、收货地址、实名信息、交易记录等必要信息。

2. 信息使用
您的信息用于账号验证、订单履约、贡献金结算、客服支持、风险控制及法律法规要求的其他用途。

3. 信息共享
未经您同意，我们不会向第三方出售您的个人信息。为完成支付、物流、短信验证等服务，我们可能向合作方提供必要信息。

4. 信息安全
我们采取合理的技术与管理措施保护您的数据安全，但互联网环境并非绝对安全，请您也注意账号与设备安全。

5. 您的权利
您可通过个人中心查看、更正部分个人信息，也可联系客服咨询注销账号等事宜。

6. 联系我们
如有隐私相关问题，请通过平台「帮助/客服」页面与我们联系。`,
};

const title = computed(() => titleMap[type.value] ?? '协议');
const content = computed(() => contentMap[type.value] ?? '暂无该协议内容');
</script>

<template>
  <div class="page">
    <van-nav-bar :title="title" left-arrow @click-left="$router.back()" />
    <div class="content">{{ content }}</div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #fff;
}
.content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.8;
  color: #323233;
  white-space: pre-wrap;
}
</style>
