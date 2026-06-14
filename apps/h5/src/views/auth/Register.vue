<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { register } from '@/api/auth';
import { useSmsCode } from '@/composables/useSmsCode';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const agreed = ref(false);

function resolveInviteCode() {
  const code = route.query.inviteCode;
  return typeof code === 'string' ? code.trim() : '';
}

const form = reactive({
  phone: '',
  smsCode: '',
  password: '',
  inviteCode: resolveInviteCode(),
});
const { countdown, send: sendCode } = useSmsCode('register');

async function onSubmit() {
  if (!agreed.value) {
    showToast('请先阅读并同意用户协议与隐私政策');
    return;
  }
  if (!/^1\d{10}$/.test(form.phone)) {
    showToast('请输入正确的手机号');
    return;
  }
  if (form.password.length < 6) {
    showToast('密码至少 6 位');
    return;
  }
  loading.value = true;
  try {
    const result = await register({
      phone: form.phone,
      smsCode: form.smsCode,
      password: form.password,
      inviteCode: form.inviteCode || undefined,
    });
    userStore.setAuth(result.token, result.userInfo);
    showToast('注册成功');
    router.replace('/home');
  } finally {
    loading.value = false;
  }
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
            <van-button size="small" type="primary" :disabled="countdown > 0" @click="sendCode(form.phone)">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="请设置密码（至少6位）"
        />
        <van-field v-model="form.inviteCode" label="邀请码" placeholder="请输入邀请码（选填）" />
      </van-cell-group>
      <div class="agree-row">
        <van-checkbox v-model="agreed" icon-size="16px" />
        <span>
          我已阅读并同意
          <router-link to="/agreement/user" class="link">《用户服务协议》</router-link>
          和
          <router-link to="/agreement/privacy" class="link">《隐私政策》</router-link>
        </span>
      </div>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">注册</van-button>
      </div>
    </van-form>
  </div>
</template>

<style scoped>
.agree-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 12px 16px 0;
  font-size: 12px;
  color: #646566;
  line-height: 1.5;
}
.link {
  color: #1989fa;
}
</style>
