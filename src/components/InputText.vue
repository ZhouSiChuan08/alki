<template>
    <!-- 输入框+发送按钮 -->
    <div class="content-input-wrapper">
        <a-textarea class="content-input" placeholder="输入消息内容, 随机选择聊天对象" v-model="inputText" allow-clear
          :textarea-attrs="textareaAttrs" 
          :auto-size="{ minRows: 1, maxRows: 4 }" @focus="addKeydownListener" @blur="removeKeydownListener"/>
        <a-button class="send-btn" shape="circle" @click="emitInputText"
          :style="{
            color: inputText.trim()? '#fff' : '#0c0c0c',
          }">
        <svg
            class="send-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24">
            <path
            fill="currentColor"
            d="m16.066 10.184l-3.89-1.795c-2.154-.994-3.231-1.491-3.725-.982c-.493.509.038 1.572 1.101 3.698c.22.44.33.659.33.895s-.11.456-.33.895c-1.063 2.126-1.594 3.19-1.1 3.698c.493.51 1.57.012 3.725-.982l3.889-1.795c1.698-.784 2.548-1.176 2.548-1.816c0-.64-.85-1.032-2.549-1.816"
            ></path>
        </svg>
        </a-button>
        <a-button class="voice-btn" shape="circle" @click="showModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" 
          class="bi bi-mic-fill" viewBox="0 0 16 16"> <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"></path><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"></path> </svg>
        </a-button>
        <!-- 语音交互模态窗 -->
          <a-modal class="voice-modal" v-model:visible="visible" hideCancel hide-title :on-before-ok="handleBeforeOk" unmountOnClose
            :ok-text="'说完了'" :mask-closable="false" :ok-button-props="{
              shape: 'round',
            }"
            >
            <MicMonitor :isCloseMic="isCloseMic" @record-saved="isRecordSaved = true"></MicMonitor>
          </a-modal>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { chatEvents } from '../shared/consts'
import MicMonitor from './MicMonitor.vue'

const textareaAttrs = ref({                       // 输入框属性设置
    spellcheck: false
})
const inputText = ref('')                         // 输入框内容
const emit = defineEmits(['inputTextEvent']);     // 定义事件
const emitInputText = () => {                     // 发送输入内容事件
    const inputTextValue = inputText.value.trim()   // 获取输入框内容
    if (inputTextValue) {                           //  如果输入内容不为空
        inputText.value = ''                          // 清空输入框内容
        emit('inputTextEvent', inputTextValue)          // 触发事件
    }
}
let keydownListener                               // 定义按键事件监听器
const addKeydownListener = () => {                // 添加按键事件监听器
    keydownListener = (event) => {
        if (event.key === 'Enter' &&!event.ctrlKey &&!event.shiftKey &&!event.altKey &&!event.metaKey) {
            emitInputText()
            event.preventDefault()               // 阻止默认行为 比如给输入框换行
        }
    }
    window.addEventListener('keydown', keydownListener);
}
const removeKeydownListener = () => {            // 移除按键事件监听器
    if (keydownListener) {
        window.removeEventListener('keydown', keydownListener);
        keydownListener = null;
    }
}

// 语音交互模态窗
const visible = ref(false)
const showModal = () => {
    visible.value = true
    isCloseMic.value = false
}
// 阻塞监听语音保存完毕
const isRecordSaved = ref(false)
// 阻塞等待recordSaved事件的函数
const waitForRecordSaved = () => {
  return new Promise((resolve, reject) => {
    // 事件监听器
    watchEffect(() => {
        if (isRecordSaved.value) {
            if (timer) {
                clearTimeout(timer)
            }
            resolve()
        }
    })
    // 超时处理
    const timeout = 5000; // 5秒超时
    const timer = setTimeout(() => {
        reject(new Error(`录音保存超时(${timeout}ms)`))
    }, timeout);
  })
}

// 处理完所有任务再关闭模态窗 会隐式地自动将visible值设置为false
const handleBeforeOk = async () => {
    isCloseMic.value = true
    // 阻塞等待音频保存完毕
    console.log('In InputText.vue, 开始阻塞等待语音保存完毕')
    await waitForRecordSaved()
    isRecordSaved.value = false  // 重置保存状态
    console.log('In InputText.vue, 语音保存完毕')
    // 请求语音识别
    const asrText = await window.ipcRenderer.invoke(chatEvents.ASR)
    console.log('In InputText.vue, 语音识别结果:', asrText)
    inputText.value = asrText
    return true;
}
// 控制麦克风组件关闭释放资源
const isCloseMic = ref(false)

</script>

<style scoped>
/*输入框*/
.content-input-wrapper {
  align-self: center;
  display: flex;
  /*border: 2px solid #6d8e53;*/
}
.content-input {
  width: 600px;
  border: none;
  border-radius: 15px;
  background-color: #97c374;
}
.content-input:focus-within {
  /*outline: 1px solid #972983;*/
  box-shadow: inset 0 -3em 3em rgba(0,0,0,0.1),
             0 0  0 2px rgb(190, 190, 190),
             0.3em 0.3em 1em rgba(0,0,0,0.3);
}
/*输入框滚动条样式 */
.content-input :deep(.arco-textarea)::-webkit-scrollbar { /* 修改滚动条样式 */
  width: 0.5rem; /* 滚动条的宽度 */
}
.content-input :deep(.arco-textarea)::-webkit-scrollbar-track {
  background-color: none;
}
.content-input :deep(.arco-textarea)::-webkit-scrollbar-thumb {
  background: #dae2a9; /* 滚动条的颜色 */
  border-radius: 5px; /* 滚动条的圆角 */
}
.content-input :deep(.arco-textarea)::-webkit-scrollbar-thumb:hover {
  background: #a1a777; /* 滚动条的颜色 */
}
/*真正的输入框*/
.content-input :deep(.arco-textarea) {
  font-size: 20px;
}
.content-input :deep(.arco-textarea)::placeholder {
  color:var(--olivine-675)
}
/*输入框清除按钮样式 */
.content-input :deep(.arco-textarea-clear-btn) {
  top:unset;
  bottom: -16px;
  width: 30px;
  height: 30px;
}
/*清除按钮的背景*/
.content-input :deep(.arco-textarea-clear-btn .arco-icon-hover)::before {
  width: 30px;
  height: 30px;
  background-color: #6d8e53;
}
/*清除按钮内的叉叉SVG*/
.content-input :deep(.arco-textarea-clear-btn .arco-icon) {
  width: 20px;
  height: 20px;
}
/*发送按钮样式 语音输入按钮样式*/
.send-btn, .voice-btn {
  width: 39px;
  height: 39px;
  margin-left: 10px;
  margin-bottom: 0px;
  align-self: end;

  outline: none;
  background-image: linear-gradient(to top, #5d7946 0%, #87ae67 80%, #6d8e53 100%);
  transition: all 0.2s ease;
  color: #0c0c0c;
}
.send-btn:hover, .voice-btn:hover {
    box-shadow: 0 2px 1px 1px #97c374, 0 6px 8px #97c374, 0 -2px 1px #97c374, 
    0 -2px 1px #677a57, inset 0 0 2px 2px #6a7c5c;
    color: white;
}
.send-btn:active, .voice-btn:active {
    box-shadow: 0 2px 1px 1px #b1dd8d, 0 2px 1px #82a565, 0 -2px 1px #82a565, 
    0 -2px 0px #b5e092, inset 0 0 3px 2px #5d7946, inset 0 0 30px #567042;
}
</style>