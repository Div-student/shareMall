<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import type { UserAddress } from '@sharemall/shared';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/api/address';
import SmAppHeader from '@/components/shop/SmAppHeader.vue';

const CHECKOUT_ADDRESS_KEY = 'checkoutAddressId';

const REGION_DATA: Record<string, Record<string, string[]>> = {
  北京市: { 北京市: ['朝阳区', '海淀区', '东城区', '西城区'] },
  上海市: { 上海市: ['浦东新区', '黄浦区', '徐汇区', '静安区'] },
  广东省: {
    深圳市: ['南山区', '福田区', '罗湖区', '宝安区'],
    广州市: ['天河区', '越秀区', '海珠区', '番禺区'],
  },
  浙江省: {
    杭州市: ['西湖区', '拱墅区', '滨江区', '余杭区'],
    宁波市: ['海曙区', '江北区', '鄞州区'],
  },
};

const PROVINCES = Object.keys(REGION_DATA);

const route = useRoute();
const router = useRouter();
const selectMode = computed(() => route.query.select === '1');

const loading = ref(true);
const saving = ref(false);
const list = ref<UserAddress[]>([]);
const showModal = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
});

const modalTitle = computed(() => (editingId.value ? '编辑收货地址' : '新增收货地址'));

const cityOptions = computed(() => {
  if (!form.value.province) return [];
  return Object.keys(REGION_DATA[form.value.province] ?? {});
});

const districtOptions = computed(() => {
  if (!form.value.province || !form.value.city) return [];
  return REGION_DATA[form.value.province]?.[form.value.city] ?? [];
});

watch(
  () => form.value.province,
  () => {
    form.value.city = '';
    form.value.district = '';
  },
);

watch(
  () => form.value.city,
  () => {
    form.value.district = '';
  },
);

function maskPhone(phone: string) {
  if (phone.length === 11) return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  return phone;
}

function resetForm() {
  form.value = {
    receiver: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: list.value.length === 0,
  };
}

async function load() {
  loading.value = true;
  try {
    const res = await fetchAddresses();
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function openModal(addr?: UserAddress) {
  if (addr) {
    editingId.value = addr.id;
    form.value = {
      receiver: addr.receiver,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault,
    };
  } else {
    editingId.value = null;
    resetForm();
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = null;
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) closeModal();
}

function selectAddress(addr: UserAddress) {
  if (!selectMode.value) return;
  sessionStorage.setItem(CHECKOUT_ADDRESS_KEY, String(addr.id));
  router.back();
}

async function onSetDefault(addr: UserAddress) {
  if (addr.isDefault) return;
  try {
    await setDefaultAddress(addr.id);
    showToast('已设为默认地址');
    await load();
  } catch {
    /* toast handled by interceptor */
  }
}

async function onDelete(addr: UserAddress) {
  if (addr.isDefault) {
    showToast('不能删除默认地址');
    return;
  }
  try {
    await showConfirmDialog({ title: '确定删除此地址？' });
  } catch {
    return;
  }
  try {
    await deleteAddress(addr.id);
    showToast('地址已删除');
    await load();
  } catch {
    /* toast handled by interceptor */
  }
}

function validateForm() {
  if (!form.value.receiver.trim()) {
    showToast('请输入收货人姓名');
    return false;
  }
  if (!/^1\d{10}$/.test(form.value.phone)) {
    showToast('请输入正确的手机号');
    return false;
  }
  if (!form.value.province || !form.value.city || !form.value.district) {
    showToast('请选择所在地区');
    return false;
  }
  if (!form.value.detail.trim()) {
    showToast('请输入详细地址');
    return false;
  }
  return true;
}

async function saveAddress() {
  if (!validateForm() || saving.value) return;
  saving.value = true;
  const payload = {
    receiver: form.value.receiver.trim(),
    phone: form.value.phone.trim(),
    province: form.value.province,
    city: form.value.city,
    district: form.value.district,
    detail: form.value.detail.trim(),
    isDefault: form.value.isDefault,
  };
  try {
    let saved: UserAddress;
    if (editingId.value) {
      saved = await updateAddress(editingId.value, payload);
      showToast('地址已保存');
    } else {
      saved = await createAddress(payload);
      showToast('地址已保存');
    }
    closeModal();
    await load();
    if (selectMode.value) {
      sessionStorage.setItem(CHECKOUT_ADDRESS_KEY, String(saved.id));
      router.back();
    }
  } catch {
    /* toast handled by interceptor */
  } finally {
    saving.value = false;
  }
}

watch(showModal, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

onMounted(load);
</script>

<template>
  <div class="page-shop address-page">
    <SmAppHeader
      :title="selectMode ? '选择收货地址' : '收货地址'"
      fixed
      @back="router.back()"
    />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <main v-else class="page-body address-body">
      <div class="page-content">
        <div
          v-for="addr in list"
          :key="addr.id"
          class="address-card"
          :class="{ 'default-addr': addr.isDefault, selectable: selectMode }"
        >
          <div class="addr-top" @click="selectAddress(addr)">
            <span class="addr-name">{{ addr.receiver }}</span>
            <span class="addr-phone">{{ maskPhone(addr.phone) }}</span>
            <span v-if="addr.isDefault" class="addr-default-tag">默认</span>
          </div>
          <div class="addr-detail" @click="selectAddress(addr)">{{ addr.fullAddress }}</div>
          <div v-if="!selectMode" class="addr-actions">
            <button
              type="button"
              class="addr-default-toggle"
              :class="{ active: addr.isDefault }"
              @click="onSetDefault(addr)"
            >
              <div class="radio-dot" />
              <span>{{ addr.isDefault ? '默认地址' : '设为默认' }}</span>
            </button>
            <div class="addr-btns">
              <button type="button" class="addr-btn" aria-label="编辑" @click="openModal(addr)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button type="button" class="addr-btn danger" aria-label="删除" @click="onDelete(addr)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button type="button" class="add-btn" @click="openModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新增收货地址
        </button>
      </div>
    </main>

    <div
      class="address-modal-overlay"
      :class="{ visible: showModal }"
      @click="onOverlayClick"
    >
      <div class="address-modal-content">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button type="button" class="modal-close" aria-label="关闭" @click="closeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-form">
          <div class="field">
            <label>收货人</label>
            <input
              v-model="form.receiver"
              class="input"
              type="text"
              placeholder="请输入收货人姓名"
            >
          </div>
          <div class="field">
            <label>手机号</label>
            <input
              v-model="form.phone"
              class="input"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
            >
          </div>
          <div class="field">
            <label>所在地区</label>
            <div class="region-picker">
              <select v-model="form.province">
                <option value="">省份</option>
                <option v-for="p in PROVINCES" :key="p" :value="p">{{ p }}</option>
              </select>
              <select v-model="form.city" :disabled="!form.province">
                <option value="">城市</option>
                <option v-for="c in cityOptions" :key="c" :value="c">{{ c }}</option>
              </select>
              <select v-model="form.district" :disabled="!form.city">
                <option value="">区县</option>
                <option v-for="d in districtOptions" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>详细地址</label>
            <textarea
              v-model="form.detail"
              class="textarea"
              rows="3"
              placeholder="请输入详细地址，如楼栋号、门牌号等"
            />
          </div>
          <div class="toggle-row">
            <div class="toggle-info">
              <h4>设为默认地址</h4>
            </div>
            <button
              type="button"
              class="toggle-switch"
              :class="{ active: form.isDefault }"
              aria-label="设为默认地址"
              @click="form.isDefault = !form.isDefault"
            />
          </div>
          <button type="button" class="modal-save-btn" :disabled="saving" @click="saveAddress">
            保存地址
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
