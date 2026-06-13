<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchKycStatus, submitKyc, type KycInfo } from '@/api/kyc';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const submitting = ref(false);
const kyc = ref<KycInfo | null>(null);
const form = ref({ realName: '', idCardNo: '' });

const statusText: Record<string, string> = {
  none: '未认证',
  pending: '审核中',
  passed: '已认证',
  rejected: '已驳回',
};

const canSubmit = computed(() => {
  const status = kyc.value?.status ?? 'none';
  return status === 'none' || status === 'rejected';
});

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace('/mine');
  }
}

async function load() {
  loading.value = true;
  try {
    kyc.value = await fetchKycStatus();
    if (kyc.value.realName) form.value.realName = kyc.value.realName;
    userStore.patchUserInfo({ kycStatus: kyc.value.status });
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!form.value.realName.trim() || !form.value.idCardNo.trim()) {
    showToast('请填写完整信息');
    return;
  }
  submitting.value = true;
  try {
    const res = await submitKyc({
      realName: form.value.realName.trim(),
      idCardNo: form.value.idCardNo.trim(),
    });
    if (userStore.userInfo) {
      userStore.patchUserInfo({ kycStatus: res.status });
    }
    showToast('提交成功，请等待审核');
    await load();
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="实名认证" left-arrow @click-left="goBack" />

    <van-loading v-if="loading" style="padding: 24px; text-align: center" />

    <template v-else>
      <van-notice-bar
        v-if="kyc?.status === 'pending'"
        left-icon="info-o"
        text="您的实名认证正在审核中，请耐心等待"
      />
      <van-notice-bar
        v-else-if="kyc?.status === 'passed'"
        left-icon="success"
        color="#07c160"
        background="#ecf9ff"
        text="您已完成实名认证"
      />
      <van-notice-bar
        v-else-if="kyc?.status === 'rejected'"
        left-icon="warning-o"
        color="#ed6a0c"
        background="#fffbe8"
        :text="`认证被驳回：${kyc.rejectReason || '请重新提交'}`"
      />

      <van-cell-group inset title="认证状态">
        <van-cell title="当前状态" :value="statusText[kyc?.status ?? 'none']" />
        <van-cell v-if="kyc?.realName" title="姓名" :value="kyc.realName" />
        <van-cell v-if="kyc?.idCardNo" title="身份证号" :value="kyc.idCardNo" />
      </van-cell-group>

      <van-form v-if="canSubmit" @submit="onSubmit">
        <van-cell-group inset title="填写信息">
          <van-field
            v-model="form.realName"
            label="真实姓名"
            placeholder="请输入真实姓名"
            maxlength="20"
            :rules="[{ required: true, message: '请输入真实姓名' }]"
          />
          <van-field
            v-model="form.idCardNo"
            label="身份证号"
            placeholder="请输入 18 位身份证号"
            maxlength="18"
            :rules="[{ required: true, message: '请输入身份证号' }]"
          />
        </van-cell-group>
        <div class="submit">
          <van-button round block type="primary" native-type="submit" :loading="submitting">
            提交认证
          </van-button>
        </div>
      </van-form>

      <div v-else class="tip">实名认证用于提现与数字藏品交易，信息仅用于身份核验。</div>
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
.submit {
  padding: 24px 16px;
}
.tip {
  padding: 16px;
  font-size: 13px;
  color: #969799;
  line-height: 1.6;
}
</style>
