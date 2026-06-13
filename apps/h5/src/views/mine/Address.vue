<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { UserAddress } from '@sharemall/shared';
import { createAddress, fetchAddresses } from '@/api/address';

const CHECKOUT_ADDRESS_KEY = 'checkoutAddressId';

const route = useRoute();
const router = useRouter();
const selectMode = computed(() => route.query.select === '1');

const loading = ref(true);
const list = ref<UserAddress[]>([]);
const showForm = ref(false);
const form = ref({
  receiver: '',
  phone: '',
  province: '广东省',
  city: '深圳市',
  district: '南山区',
  detail: '',
});

async function load() {
  loading.value = true;
  try {
    const res = await fetchAddresses();
    list.value = res.list;
  } finally {
    loading.value = false;
  }
}

function selectAddress(addr: UserAddress) {
  if (!selectMode.value) return;
  sessionStorage.setItem(CHECKOUT_ADDRESS_KEY, String(addr.id));
  router.back();
}

async function submit() {
  if (!form.value.receiver || !form.value.phone || !form.value.detail) {
    showToast('请填写完整信息');
    return;
  }
  const created = await createAddress({ ...form.value, isDefault: list.value.length === 0 });
  showToast('添加成功');
  showForm.value = false;
  form.value.detail = '';
  await load();

  if (selectMode.value) {
    sessionStorage.setItem(CHECKOUT_ADDRESS_KEY, String(created.id));
    router.back();
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <van-nav-bar
      :title="selectMode ? '选择收货地址' : '收货地址'"
      left-arrow
      @click-left="$router.back()"
    />

    <van-loading v-if="loading" style="padding: 48px; text-align: center" />
    <van-empty v-else-if="!list.length && !showForm" description="暂无收货地址" />
    <div v-else class="list">
      <div
        v-for="addr in list"
        :key="addr.id"
        class="addr-card"
        :class="{ selectable: selectMode }"
        @click="selectAddress(addr)"
      >
        <div class="addr-head">
          <span class="name">{{ addr.receiver }} {{ addr.phone }}</span>
          <van-tag v-if="addr.isDefault" type="primary" plain>默认</van-tag>
          <van-icon v-if="selectMode" name="arrow" class="arrow" />
        </div>
        <div class="addr-detail">{{ addr.fullAddress }}</div>
      </div>
    </div>

    <van-popup v-model:show="showForm" position="bottom" round :style="{ height: '70%' }">
      <div class="form">
        <div class="form-title">新增地址</div>
        <van-field v-model="form.receiver" label="收货人" placeholder="请输入收货人" />
        <van-field v-model="form.phone" label="手机号" type="tel" placeholder="请输入手机号" />
        <van-field v-model="form.province" label="省" />
        <van-field v-model="form.city" label="市" />
        <van-field v-model="form.district" label="区" />
        <van-field v-model="form.detail" label="详细地址" placeholder="街道门牌号" />
        <van-button block type="primary" style="margin-top: 16px" @click="submit">保存</van-button>
      </div>
    </van-popup>

    <div style="padding: 16px">
      <van-button block type="primary" @click="showForm = true">新增收货地址</van-button>
    </div>
  </div>
</template>

<style scoped>
.list {
  padding: 8px 12px;
}
.addr-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
}
.addr-card.selectable {
  cursor: pointer;
}
.addr-card.selectable:active {
  background: #f7f8fa;
}
.addr-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.name {
  font-weight: 600;
}
.arrow {
  margin-left: auto;
  color: #969799;
}
.addr-detail {
  color: #646566;
  font-size: 13px;
  line-height: 1.4;
}
.form {
  padding: 16px;
}
.form-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
</style>
