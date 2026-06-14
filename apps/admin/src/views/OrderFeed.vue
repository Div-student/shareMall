<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchOrderFeedConfig, saveOrderFeedConfig } from '@/api/operations';

const loading = ref(false);
const saving = ref(false);
const form = reactive({
  enabled: true,
  minDisplay: 5,
  mockTemplates: [] as string[],
});
const templateInput = ref('');

async function load() {
  loading.value = true;
  try {
    const data = await fetchOrderFeedConfig();
    Object.assign(form, data);
  } finally {
    loading.value = false;
  }
}

function addTemplate() {
  if (!templateInput.value.trim()) return;
  form.mockTemplates.push(templateInput.value.trim());
  templateInput.value = '';
}

function removeTemplate(index: number) {
  form.mockTemplates.splice(index, 1);
}

async function onSave() {
  saving.value = true;
  try {
    await saveOrderFeedConfig(form);
    ElMessage.success('配置已保存');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div v-loading="loading">
    <el-form label-width="120px" style="max-width: 640px">
      <el-form-item label="启用动态">
        <el-switch v-model="form.enabled" />
      </el-form-item>
      <el-form-item label="最少展示条数">
        <el-input-number v-model="form.minDisplay" :min="1" :max="20" />
      </el-form-item>
      <el-form-item label="Mock 模板">
        <div style="width: 100%">
          <div v-for="(item, index) in form.mockTemplates" :key="index" class="tpl-row">
            <span>{{ item }}</span>
            <el-button link type="danger" @click="removeTemplate(index)">删除</el-button>
          </div>
          <el-input v-model="templateInput" placeholder="如：用户{phone}刚刚下单了本商品" />
          <el-button style="margin-top: 8px" @click="addTemplate">添加模板</el-button>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.tpl-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #ebeef5;
}
</style>
