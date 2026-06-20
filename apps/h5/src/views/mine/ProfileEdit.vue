<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchProfile, updateProfile } from '@/api/user';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useUserStore } from '@/stores/user';

type GenderValue = 'male' | 'female' | 'unknown';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const saving = ref(false);
const nickname = ref('');
const gender = ref<GenderValue>('unknown');
const birthday = ref('');
const phone = ref('');
const avatar = ref('');
const avatarPreview = ref('');

const avatarText = computed(() => {
  const name = nickname.value.trim();
  if (name) return name.slice(0, 1);
  return phone.value?.slice(-1) ?? 'U';
});

const maskedPhone = computed(() => {
  if (!phone.value || phone.value.length !== 11) return phone.value;
  return `${phone.value.slice(0, 3)}****${phone.value.slice(7)}`;
});

async function load() {
  loading.value = true;
  try {
    const profile = await fetchProfile();
    nickname.value = profile.nickname || '';
    gender.value = (profile.gender as GenderValue) || 'unknown';
    birthday.value = profile.birthday ? profile.birthday.slice(0, 10) : '';
    phone.value = profile.phone;
    avatar.value = profile.avatar || '';
    avatarPreview.value = profile.avatar || '';
  } finally {
    loading.value = false;
  }
}

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const size = 128;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas unavailable'));
        return;
      }
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('load failed'));
    };
    img.src = objectUrl;
  });
}

async function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片不能超过 5MB');
    return;
  }
  try {
    const dataUrl = await compressAvatar(file);
    avatarPreview.value = dataUrl;
    avatar.value = dataUrl;
  } catch {
    showToast('图片读取失败，请重试');
  }
}

async function saveProfile() {
  const name = nickname.value.trim();
  if (!name) {
    showToast('请输入昵称');
    return;
  }
  if (saving.value) return;
  saving.value = true;
  try {
    const profile = await updateProfile({
      nickname: name,
      avatar: avatar.value || undefined,
      gender: gender.value,
      birthday: birthday.value || undefined,
    });
    userStore.patchUserInfo({
      nickname: profile.nickname || null,
      avatar: profile.avatar || null,
    });
    showToast('保存成功');
    router.back();
  } catch {
    /* toast handled by interceptor */
  } finally {
    saving.value = false;
  }
}

function goResetPassword() {
  router.push('/reset-password');
}

function onChangePhone() {
  showToast('请联系客服更换手机号');
}

onMounted(load);
</script>

<template>
  <div class="page-shop profile-edit-page">
    <SmAppHeader title="基本信息" fixed @back="router.back()" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <main v-else class="page-body profile-edit-body">
      <div class="page-content">
        <div class="avatar-section">
          <label class="avatar-edit">
            <input type="file" accept="image/*" class="avatar-file-input" @change="onAvatarChange">
            <div v-if="avatarPreview" class="avatar-circle avatar-circle--img">
              <img :src="avatarPreview" alt="">
            </div>
            <div v-else class="avatar-circle">{{ avatarText }}</div>
            <div class="camera-overlay">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </label>
        </div>

        <div class="form-section">
          <div class="form-row">
            <label>昵称</label>
            <div class="form-value">
              <input
                v-model="nickname"
                type="text"
                maxlength="20"
                placeholder="请输入昵称"
              >
            </div>
          </div>
          <div class="form-row">
            <label>性别</label>
            <div class="form-value">
              <select v-model="gender">
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="unknown">保密</option>
              </select>
            </div>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <div class="form-row">
            <label>生日</label>
            <div class="form-value">
              <input v-model="birthday" type="date" class="date-input">
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="form-row">
            <label>手机号</label>
            <div class="form-value">
              <span>{{ maskedPhone }}</span>
            </div>
            <button type="button" class="form-link" @click="onChangePhone">更换</button>
          </div>
          <button type="button" class="form-row form-row-btn" @click="goResetPassword">
            <label>密码</label>
            <div class="form-value">
              <span>修改密码</span>
            </div>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <button type="button" class="save-btn" :disabled="saving" @click="saveProfile">
          保存修改
        </button>
      </div>
    </main>
  </div>
</template>
