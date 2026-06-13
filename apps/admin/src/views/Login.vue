<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { adminLogin } from '@/api/admin';
import { useAdminStore } from '@/stores/admin';

const router = useRouter();
const adminStore = useAdminStore();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

async function onLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号和密码');
    return;
  }
  loading.value = true;
  try {
    const res = await adminLogin(form);
    adminStore.setAuth(res.token, res.adminInfo);
    ElMessage.success('登录成功');
    router.replace('/dashboard');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2>shareMall 管理后台</h2>
      <p class="hint">默认账号：admin / admin123</p>
      <el-form :model="form" label-width="0" @submit.prevent="onLogin">
        <el-form-item>
          <el-input v-model="form.username" placeholder="账号" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-button type="primary" style="width: 100%" :loading="loading" @click="onLogin">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 360px;
  text-align: center;
}
.hint {
  margin: 0 0 16px;
  font-size: 12px;
  color: #909399;
}
</style>
