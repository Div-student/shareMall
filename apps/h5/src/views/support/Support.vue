<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchServiceConfig, type ServiceConfig } from '@/api/operations';

const config = ref<ServiceConfig | null>(null);
const activeNames = ref<number[]>([0]);

onMounted(async () => {
  config.value = await fetchServiceConfig();
});
</script>

<template>
  <div class="page">
    <van-nav-bar title="帮助与客服" left-arrow @click-left="$router.back()" />
    <van-cell-group v-if="config" inset title="联系客服">
      <van-cell title="客服电话" :value="config.phone" is-link :url="`tel:${config.phone}`" />
      <van-cell title="客服微信" :value="config.wechat" />
      <van-cell title="工作时间" :value="config.workTime" />
      <van-cell
        v-if="config.onlineUrl"
        title="在线客服"
        is-link
        :url="config.onlineUrl"
      />
    </van-cell-group>

    <van-cell-group v-if="config?.faq?.length" inset title="常见问题" style="margin-top: 12px">
      <van-collapse v-model="activeNames">
        <van-collapse-item
          v-for="(item, index) in config.faq"
          :key="index"
          :title="item.question"
          :name="index"
        >
          {{ item.answer }}
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>
  </div>
</template>
