<script setup lang="ts"></script>

<template>
  <div class="page">
    <van-nav-bar title="基本信息" left-arrow @click-left="$router.back()" />
    <van-cell-group inset>
      <van-cell title="头像" is-link />
      <van-cell title="昵称" is-link value="未设置" />
      <van-cell title="手机号" value="-" />
    </van-cell-group>
  </div>
</template>
