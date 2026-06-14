<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchServiceConfig, saveServiceConfig, type ServiceConfig } from '@/api/operations';

const loading = ref(false);
const saving = ref(false);
const form = reactive<ServiceConfig>({
  phone: '',
  wechat: '',
  workTime: '',
  onlineUrl: '',
  faq: [],
});

async function load() {
  loading.value = true;
  try {
    const data = await fetchServiceConfig();
    Object.assign(form, data);
    if (!form.faq?.length) form.faq = [];
  } finally {
    loading.value = false;
  }
}

function addFaq() {
  form.faq.push({ question: '', answer: '', sort: form.faq.length });
}

function removeFaq(index: number) {
  form.faq.splice(index, 1);
}

async function onSave() {
  saving.value = true;
  try {
    await saveServiceConfig(form);
    ElMessage.success('配置已保存');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div v-loading="loading">
    <el-form label-width="100px" style="max-width: 720px">
      <el-form-item label="客服电话"><el-input v-model="form.phone" /></el-form-item>
      <el-form-item label="客服微信"><el-input v-model="form.wechat" /></el-form-item>
      <el-form-item label="工作时间"><el-input v-model="form.workTime" /></el-form-item>
      <el-form-item label="在线客服链接"><el-input v-model="form.onlineUrl" placeholder="可选" /></el-form-item>

      <el-divider>常见问题 FAQ</el-divider>
      <div v-for="(item, index) in form.faq" :key="index" class="faq-item">
        <el-input v-model="item.question" placeholder="问题" style="margin-bottom: 8px" />
        <el-input v-model="item.answer" type="textarea" :rows="2" placeholder="回答" />
        <el-button link type="danger" style="margin-top: 4px" @click="removeFaq(index)">删除</el-button>
      </div>
      <el-button style="margin-bottom: 16px" @click="addFaq">添加 FAQ</el-button>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="onSave">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.faq-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
