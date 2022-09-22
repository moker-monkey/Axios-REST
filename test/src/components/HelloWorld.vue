<script setup lang="ts">
import { ref } from 'vue'
import api,{ getMenu, net_get } from "../api"

defineProps<{ msg: string }>()

const count = ref(0)
const test_request = () => {
  let _getMenu = new api('core')
  _getMenu.GET({ test: 'hello',msg:'success' }).then((data: any) => {
    console.log(data)
  })
}
const net_request = () => {
  net_get.GET({ test: 'net' }).then((data: any) => {
    console.log(data)
  })
}


net_get.setWebworker(function () {
  onmessage = ({ data: { jobId, message } }) => {
    console.log('i am receive message is:-----', message);
    console.log('i am receive jobId is:=====', jobId)
    postMessage({ jobId, result: { msg: 'this is a message' } });
  };
})
const web_worker_test = () => {
  net_get.GET_WORKER({ hello: 'world' }).then((res: any) => {
    console.log('fina_get', res)
  })
}
</script>

<template>
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
  <div class="card">
    <div class="text-5xl">webworker请求：</div>
    <button type="button" @click="web_worker_test">
      测试
    </button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
