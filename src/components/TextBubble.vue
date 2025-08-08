<template>
    <div class="text-wrapper">
        <div v-if="message.sendStatus === 'wait'">
            <Spin/>
        </div>
        <div class="fail-icon"  v-else-if="message.sendStatus ==='fail'">
            <IconExclamationCircleFill strokeLinecap="round" strokeLinejoin="round" :size="20"/>
        </div>
        <div class="show-user-text" ref="showUserText">
            {{ message.string }}
        </div>

    </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { Spin } from '@arco-design/web-vue'
import {IconExclamationCircleFill} from '@arco-design/web-vue/es/icon'
const showUserText = ref(null)   // 显示用户消息的气泡
const props = defineProps({
    message: {
        type: Object,
        default: () => ({
            string: '用户消息气泡',
            sendStatus: 'wait'  // 发送状态 wait:等待发送 success:发送成功 fail:发送失败
        }),
        reuqired: true
    }
})
onMounted(() => {
    // nextTick 确保组件渲染完成
    nextTick(() => {
        if(showUserText.value) {
            showUserText.value.classList.add('visible')
        }
    })
})
</script>

<style scoped>
    .text-wrapper {
        display: flex;
        align-items: center;
    }
    .show-user-text {
        padding: 5px 8px;
        background-color: var(--olivine-450);
        border-radius: 10px;
        max-width: 400px;
        opacity: 0;
        color: white;
        transition: opacity 0.1s ease-in-out;
        white-space: pre-wrap; /*pre-line：保留换行符，但合并连续的空白符  pre-wrap：保留换行符和空白符，并在必要时自动换行*/
        line-height: 1.5;
    }
    .show-user-text.visible {
        opacity: 1;
    }
    .fail-icon {
        color: var(--rust-450);
        display: flex;
        align-items: center;
    }
</style>