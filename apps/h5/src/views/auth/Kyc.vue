<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { fetchKycStatus, submitKyc, type KycInfo } from '@/api/kyc';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';
import { useUserStore } from '@/stores/user';

type ViewStatus = 'unverified' | 'pending' | 'verified';

const TABS: { key: ViewStatus; label: string }[] = [
  { key: 'unverified', label: '未认证' },
  { key: 'pending', label: '审核中' },
  { key: 'verified', label: '已认证' },
];

const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const submitting = ref(false);
const kyc = ref<KycInfo | null>(null);
const form = ref({ realName: '', idCardNo: '' });
const frontUploaded = ref(false);
const backUploaded = ref(false);

const viewStatus = computed<ViewStatus>(() => {
  const status = kyc.value?.status ?? 'none';
  if (status === 'passed') return 'verified';
  if (status === 'pending') return 'pending';
  return 'unverified';
});

const canSubmit = computed(() => {
  const status = kyc.value?.status ?? 'none';
  return status === 'none' || status === 'rejected';
});

function maskName(name: string) {
  if (!name) return '';
  if (name.length <= 1) return `${name}*`;
  return `${name[0]}*`;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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
    if (kyc.value.realName && canSubmit.value) {
      form.value.realName = kyc.value.realName;
    }
    userStore.patchUserInfo({ kycStatus: kyc.value.status });
  } finally {
    loading.value = false;
  }
}

function handleUpload(side: 'front' | 'back', e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('请上传图片文件');
    input.value = '';
    return;
  }
  if (side === 'front') {
    frontUploaded.value = true;
  } else {
    backUploaded.value = true;
  }
  showToast('照片上传成功');
  input.value = '';
}

async function onSubmit() {
  const name = form.value.realName.trim();
  const idNum = form.value.idCardNo.trim();

  if (!name) {
    showToast('请输入真实姓名');
    return;
  }
  if (idNum.length < 15) {
    showToast('请输入正确的身份证号');
    return;
  }
  if (!frontUploaded.value || !backUploaded.value) {
    showToast('请上传身份证正反面照片');
    return;
  }

  submitting.value = true;
  try {
    const res = await submitKyc({ realName: name, idCardNo: idNum });
    if (userStore.userInfo) {
      userStore.patchUserInfo({ kycStatus: res.status });
    }
    showToast('认证信息已提交，请等待审核');
    frontUploaded.value = false;
    backUploaded.value = false;
    await load();
  } catch {
    /* toast handled by interceptor */
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-shop kyc-page">
    <SmAppHeader title="实名认证" fixed @back="goBack" />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />

    <main v-else class="page-body kyc-body">
      <div class="page-content">
        <div class="tab-bar-row">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            type="button"
            class="tab-chip"
            :class="{ active: viewStatus === tab.key }"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 未认证 -->
        <div v-if="viewStatus === 'unverified'">
          <div class="status-banner unverified">
            <div class="status-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div class="status-info">
              <h3>尚未完成实名认证</h3>
              <p>完成认证后可使用贡献金提现等功能</p>
            </div>
          </div>

          <div class="form-section">
            <div class="field">
              <label for="realName">真实姓名</label>
              <input
                id="realName"
                v-model="form.realName"
                class="input"
                type="text"
                placeholder="请输入身份证上的姓名"
                autocomplete="name"
                maxlength="20"
              >
            </div>
            <div class="field">
              <label for="idNumber">身份证号</label>
              <input
                id="idNumber"
                v-model="form.idCardNo"
                class="input"
                type="text"
                placeholder="请输入18位身份证号"
                maxlength="18"
              >
            </div>
          </div>

          <div class="section-gap" />

          <div class="section-title">上传身份证照片</div>
          <div class="upload-grid">
            <label class="upload-area" :class="{ 'has-image': frontUploaded }">
              <input type="file" accept="image/*" class="upload-file-input" @change="handleUpload('front', $event)">
              <template v-if="frontUploaded">
                <div class="uploaded-preview">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div class="upload-done-label">人像面已上传</div>
              </template>
              <template v-else>
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <div class="upload-text">人像面</div>
                <div class="upload-label">点击上传</div>
              </template>
            </label>

            <label class="upload-area" :class="{ 'has-image': backUploaded }">
              <input type="file" accept="image/*" class="upload-file-input" @change="handleUpload('back', $event)">
              <template v-if="backUploaded">
                <div class="uploaded-preview">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div class="upload-done-label">国徽面已上传</div>
              </template>
              <template v-else>
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <div class="upload-text">国徽面</div>
                <div class="upload-label">点击上传</div>
              </template>
            </label>
          </div>

          <div v-if="canSubmit" class="submit-wrap">
            <button
              type="button"
              class="btn btn-primary btn-block btn-lg"
              :disabled="submitting"
              @click="onSubmit"
            >
              {{ submitting ? '提交中...' : '提交认证' }}
            </button>
          </div>
        </div>

        <!-- 审核中 -->
        <div v-else-if="viewStatus === 'pending'">
          <div class="status-banner pending">
            <div class="status-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="status-info">
              <h3>认证审核中</h3>
              <p>您的实名认证信息正在审核，请耐心等待</p>
            </div>
          </div>

          <div class="form-card">
            <div class="verified-detail">
              <div class="verified-row">
                <span class="label">真实姓名</span>
                <span class="value">{{ maskName(kyc?.realName ?? '') }}</span>
              </div>
              <div class="verified-row">
                <span class="label">身份证号</span>
                <span class="value">{{ kyc?.idCardNo || '-' }}</span>
              </div>
              <div class="verified-row">
                <span class="label">提交时间</span>
                <span class="value">{{ formatDate(kyc?.submittedAt) }}</span>
              </div>
              <div class="verified-row">
                <span class="label">认证状态</span>
                <span class="status-tag-warn">审核中</span>
              </div>
            </div>
          </div>

          <div class="pending-tip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>审核通常需要1-3个工作日，审核通过后您将收到系统通知。期间如有疑问请联系客服。</span>
          </div>
        </div>

        <!-- 已认证 -->
        <div v-else>
          <div class="status-banner verified">
            <div class="status-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div class="status-info">
              <h3>已完成实名认证</h3>
              <p>您已通过实名认证，可使用全部功能</p>
            </div>
          </div>

          <div class="form-card">
            <div class="verified-detail">
              <div class="verified-row">
                <span class="label">真实姓名</span>
                <span class="value">{{ kyc?.realName || '-' }}</span>
              </div>
              <div class="verified-row">
                <span class="label">身份证号</span>
                <span class="value">{{ kyc?.idCardNo || '-' }}</span>
              </div>
              <div class="verified-row">
                <span class="label">认证时间</span>
                <span class="value">{{ formatDate(kyc?.auditedAt) }}</span>
              </div>
              <div class="verified-row">
                <span class="label">认证状态</span>
                <span class="tag-verified">已认证</span>
              </div>
            </div>
          </div>

          <div class="verified-tip">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            您的实名认证信息已通过审核，现在可以使用贡献金提现等全部功能。
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
