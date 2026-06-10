<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="page">
    <div class="header">
      <van-image round width="56" height="56" />
      <div class="info">
        <div class="name">未登录</div>
        <div class="login" @click="router.push('/login')">点击登录 / 注册</div>
      </div>
    </div>

    <div class="assets">
      <div class="asset">
        <b>0</b>
        <span>可用贡献金</span>
      </div>
      <div class="asset" @click="router.push('/withdraw')">
        <b>0</b>
        <span>提现金</span>
      </div>
    </div>

    <van-grid :column-num="4">
      <van-grid-item icon="todo-list-o" text="任务中心" />
      <van-grid-item icon="orders-o" text="我的订单" @click="router.push('/orders')" />
      <van-grid-item icon="diamond-o" text="数字藏品" />
      <van-grid-item icon="contact" text="基本信息" @click="router.push('/mine/profile')" />
    </van-grid>

    <van-cell-group inset>
      <van-cell title="收货地址" is-link @click="router.push('/mine/address')" />
      <van-cell title="我的邀请" is-link />
      <van-cell title="设置" is-link />
    </van-cell-group>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: #fff;
}
.name {
  font-size: 18px;
  font-weight: 600;
}
.login {
  font-size: 13px;
  color: #969799;
}
.assets {
  display: flex;
  background: #fff;
  margin-bottom: 12px;
}
.asset {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
}
.asset b {
  font-size: 18px;
  color: #ee0a24;
}
.asset span {
  font-size: 12px;
  color: #969799;
}
</style>
