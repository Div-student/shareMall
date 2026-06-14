<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchSmsConfig, saveSmsConfig } from '@/api/sms';

const loading = ref(false);
const saving = ref(false);
const form = reactive({
  provider: 'mock' as 'mock' | 'aliyun' | 'tencent',
  signName: '',
  templateCode: '',
  accessKey: '',
  accessSecret: '',
  devCode: '8888',
});

const providerOptions = [
  { label: 'Mock（开发）', value: 'mock' },
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' },
];

async function load() {
  loading.value = true;
  try {
    const res = await fetchSmsConfig();
    Object.assign(form, res);
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  saving.value = true;
  try {
    await saveSmsConfig({ ...form });
    ElMessage.success('保存成功');
    await load();
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <el-card v-loading="loading">
    <el-alert
      title="开发环境默认使用 Mock 短信，验证码可在下方配置；生产环境请切换为真实服务商并填写密钥。"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    />
    <el-form label-width="120px" style="max-width: 640px">
      <el-form-item label="服务商">
        <el-select v-model="form.provider" style="width: 100%">
          <el-option v-for="item in providerOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Mock 验证码">
        <el-input v-model="form.devCode" placeholder="开发环境固定验证码" />
      </el-form-item>
      <el-form-item label="短信签名">
        <el-input v-model="form.signName" placeholder="生产环境短信签名" />
      </el-form-item>
      <el-form-item label="模板 Code">
        <el-input v-model="form.templateCode" placeholder="验证码模板 ID" />
      </el-form-item>
      <el-form-item label="Access Key">
        <el-input v-model="form.accessKey" placeholder="服务商 Access Key" />
      </el-form-item>
      <el-form-item label="Access Secret">
        <el-input v-model="form.accessSecret" type="password" show-password placeholder="留空则不修改" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="onSave">保存配置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
