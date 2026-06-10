<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const mode = ref<'password' | 'sms'>('password');
const form = reactive({ phone: '', password: '', smsCode: '' });

function onSubmit() {
  // TODO: 调用 /api/auth/login 或 /api/auth/login-sms
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="登录" />
    <van-tabs v-model:active="mode">
      <van-tab title="密码登录" name="password" />
      <van-tab title="短信登录" name="sms" />
    </van-tabs>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="form.phone" label="手机号" placeholder="请输入手机号" />
        <van-field
          v-if="mode === 'password'"
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="请输入密码"
        />
        <van-field
          v-else
          v-model="form.smsCode"
          label="验证码"
          placeholder="请输入验证码"
        >
          <template #button>
            <van-button size="small" type="primary">获取验证码</van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit">登录</van-button>
        <van-button round block plain style="margin-top: 12px" @click="router.push('/register')">
          注册新账号
        </van-button>
      </div>
    </van-form>
  </div>
</template>
