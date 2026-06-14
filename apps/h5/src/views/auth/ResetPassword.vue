<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { resetPassword } from '@/api/auth';
import { useSmsCode } from '@/composables/useSmsCode';

const router = useRouter();
const loading = ref(false);
const form = reactive({ phone: '', smsCode: '', newPassword: '', confirmPassword: '' });
const { countdown, send: sendCode } = useSmsCode('reset');

async function onSubmit() {
  if (!/^1\d{10}$/.test(form.phone)) {
    showToast('请输入正确的手机号');
    return;
  }
  if (!form.smsCode) {
    showToast('请输入验证码');
    return;
  }
  if (form.newPassword.length < 6) {
    showToast('密码至少 6 位');
    return;
  }
  if (form.newPassword !== form.confirmPassword) {
    showToast('两次密码不一致');
    return;
  }

  loading.value = true;
  try {
    await resetPassword({
      phone: form.phone,
      smsCode: form.smsCode,
      newPassword: form.newPassword,
    });
    showToast('密码已重置，请登录');
    router.replace('/login');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="找回密码" left-arrow @click-left="router.back()" />
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="form.phone" label="手机号" placeholder="请输入注册手机号" />
        <van-field v-model="form.smsCode" label="验证码" placeholder="请输入验证码">
          <template #button>
            <van-button size="small" type="primary" :disabled="countdown > 0" @click="sendCode(form.phone)">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="form.newPassword"
          type="password"
          label="新密码"
          placeholder="至少 6 位"
        />
        <van-field
          v-model="form.confirmPassword"
          type="password"
          label="确认密码"
          placeholder="再次输入新密码"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          确认重置
        </van-button>
      </div>
    </van-form>
  </div>
</template>
