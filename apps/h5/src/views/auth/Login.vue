<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { login, loginSms } from '@/api/auth';
import { useSmsCode } from '@/composables/useSmsCode';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const mode = ref<'password' | 'sms'>('password');
const loading = ref(false);
const form = reactive({ phone: '', password: '', smsCode: '' });
const { countdown, send: sendCode } = useSmsCode('login');

async function onSubmit() {
  if (!/^1\d{10}$/.test(form.phone)) {
    showToast('请输入正确的手机号');
    return;
  }
  loading.value = true;
  try {
    const result =
      mode.value === 'password'
        ? await login({ phone: form.phone, password: form.password })
        : await loginSms({ phone: form.phone, smsCode: form.smsCode });
    userStore.setAuth(result.token, result.userInfo);
    showToast('登录成功');
    const redirect = (route.query.redirect as string) || '/home';
    router.replace(redirect);
  } finally {
    loading.value = false;
  }
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
        <van-field v-else v-model="form.smsCode" label="验证码" placeholder="请输入验证码">
          <template #button>
            <van-button size="small" type="primary" :disabled="countdown > 0" @click="sendCode(form.phone)">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">登录</van-button>
        <van-button round block plain style="margin-top: 12px" @click="router.push('/register')">
          注册新账号
        </van-button>
      </div>
    </van-form>
  </div>
</template>
