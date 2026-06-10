<script setup lang="ts">
import { DEFAULT_CHECKIN_DAYS } from '@sharemall/shared';
</script>

<template>
  <div class="page">
    <van-nav-bar title="打卡兑现" left-arrow @click-left="$router.back()" />
    <van-cell-group inset>
      <van-cell title="当前档位" value="-" />
      <van-cell title="每日可兑现" value="0" />
      <van-cell title="签到进度" :value="`0 / ${DEFAULT_CHECKIN_DAYS}`" />
    </van-cell-group>
    <div style="padding: 16px">
      <van-button block type="primary">今日打卡</van-button>
    </div>
    <van-notice-bar
      wrapable
      :scrollable="false"
      text="规则：达到档位后开始打卡，30 天平均兑现，漏打卡当天收益作废。"
    />
  </div>
</template>
