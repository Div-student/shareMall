<script setup lang="ts">
import { reactive } from 'vue';

const form = reactive({ amount: '', method: 'wechat' });
</script>

<template>
  <div class="page">
    <van-nav-bar title="提现" left-arrow @click-left="$router.back()" />
    <van-cell-group inset>
      <van-cell title="可提现余额（提现金）" value="¥0.00" />
      <van-field v-model="form.amount" type="number" label="提现金额" placeholder="请输入提现金额" />
    </van-cell-group>
    <van-radio-group v-model="form.method" style="padding: 12px 16px">
      <van-cell-group inset>
        <van-cell title="微信" clickable @click="form.method = 'wechat'">
          <template #right-icon><van-radio name="wechat" /></template>
        </van-cell>
        <van-cell title="支付宝" clickable @click="form.method = 'alipay'">
          <template #right-icon><van-radio name="alipay" /></template>
        </van-cell>
        <van-cell title="银行卡" clickable @click="form.method = 'bank'">
          <template #right-icon><van-radio name="bank" /></template>
        </van-cell>
      </van-cell-group>
    </van-radio-group>
    <div style="padding: 16px">
      <van-button block type="primary">申请提现</van-button>
    </div>
    <van-notice-bar
      wrapable
      :scrollable="false"
      text="说明：仅提现金可提现，可用贡献金仅限站内消费。"
    />
  </div>
</template>
