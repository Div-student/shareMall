<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = reactive({ username: '', password: '' });

function onLogin() {
  // TODO: 调用后台登录接口
  router.push('/dashboard');
}
</script>

<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2>shareMall 管理后台</h2>
      <el-form :model="form" label-width="0">
        <el-form-item>
          <el-input v-model="form.username" placeholder="账号" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-button type="primary" style="width: 100%" @click="onLogin">登录</el-button>
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
</style>
