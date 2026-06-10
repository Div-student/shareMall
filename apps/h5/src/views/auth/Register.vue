<script setup lang="ts">
import { reactive } from 'vue';

const form = reactive({ phone: '', smsCode: '', password: '', inviteCode: '' });

function onSubmit() {
  // TODO: 调用 /api/auth/register（邀请码 + 短信）
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="注册" left-arrow @click-left="$router.back()" />
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="form.phone" label="手机号" placeholder="请输入手机号" />
        <van-field v-model="form.smsCode" label="验证码" placeholder="请输入验证码">
          <template #button>
            <van-button size="small" type="primary">获取验证码</van-button>
          </template>
        </van-field>
        <van-field
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="请设置密码"
        />
        <van-field v-model="form.inviteCode" label="邀请码" placeholder="请输入邀请码（选填）" />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit">注册</van-button>
      </div>
    </van-form>
  </div>
</template>
