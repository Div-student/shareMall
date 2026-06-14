<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showLoadingToast, showToast, closeToast } from 'vant';
import { fetchProfile, updateProfile } from '@/api/user';

const router = useRouter();
const loading = ref(true);
const nickname = ref('');
const phone = ref('');
const inviteCode = ref('');
const kycStatus = ref('');
const showEdit = ref(false);
const editNickname = ref('');

const kycLabel: Record<string, string> = {
  none: '未认证',
  pending: '审核中',
  passed: '已认证',
  rejected: '已驳回',
};

async function load() {
  loading.value = true;
  try {
    const profile = await fetchProfile();
    nickname.value = profile.nickname || '未设置';
    phone.value = profile.phone;
    inviteCode.value = profile.inviteCode;
    kycStatus.value = profile.kycStatus;
  } finally {
    loading.value = false;
  }
}

function openEdit() {
  editNickname.value = nickname.value === '未设置' ? '' : nickname.value;
  showEdit.value = true;
}

async function saveNickname() {
  const value = editNickname.value.trim();
  if (!value) {
    showToast('请输入昵称');
    return;
  }
  const toast = showLoadingToast({ message: '保存中...', forbidClick: true });
  try {
    const profile = await updateProfile({ nickname: value });
    nickname.value = profile.nickname || value;
    showEdit.value = false;
    showToast('保存成功');
  } finally {
    closeToast();
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar title="基本信息" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <template v-else>
      <van-cell-group inset>
        <van-cell title="头像" is-link>
          <template #value>
            <van-image round width="40" height="40" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
          </template>
        </van-cell>
        <van-cell title="昵称" :value="nickname" is-link @click="openEdit" />
        <van-cell title="手机号" :value="phone" />
        <van-cell title="邀请码" :value="inviteCode" />
        <van-cell title="实名状态" :value="kycLabel[kycStatus] ?? kycStatus" is-link @click="router.push('/kyc')" />
      </van-cell-group>
    </template>

    <van-dialog
      v-model:show="showEdit"
      title="修改昵称"
      show-cancel-button
      @confirm="saveNickname"
    >
      <van-field v-model="editNickname" placeholder="请输入昵称" style="margin: 12px 16px" />
    </van-dialog>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}
</style>
