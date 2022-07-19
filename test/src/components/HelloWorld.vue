<script setup lang="ts">
import { ref } from 'vue'
import {getMenu,net_get} from "../api"

defineProps<{ msg: string }>()

const count = ref(0)
const test_request = ()=>{
  getMenu.GET({test:'hello'}).then((data)=>{
    console.log(data)
  })
}
const net_request = ()=>{
  net_get.GET({test:'net'}).then((data)=>{
    console.log(data)
  })
}

</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <div class="text-5xl">测试本地请求：</div>
    <button type="button" @click="test_request">
    测试
    </button>
  </div>
  <div class="card">
    <div class="text-5xl">测试网络请求：</div>
    <button type="button" @click="net_request">
    测试
    </button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
