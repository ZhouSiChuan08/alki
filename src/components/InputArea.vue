<template>
    <a-layout class="layout-input-area">
        <a-layout-content>
            <a-textarea class="content-input" placeholder="开始聊天..." v-model="inputText" allow-clear
            :textarea-attrs="textareaAttrs" 
            :auto-size="{ minRows: 1, maxRows: 4 }" @focus="addKeydownListener" @blur="removeKeydownListener"/>
            <!-- 语音交互模态窗 -->
            <a-modal class="voice-modal" v-model:visible="visible" hideCancel hide-title :on-before-ok="handleBeforeOk" unmountOnClose
              :ok-text="'说完了'" :mask-closable="false" :ok-button-props="{
                shape: 'round',
              }"
              >
              <MicMonitor :isCloseMic="isCloseMic" @record-saved="isRecordSaved = true"></MicMonitor>
            </a-modal>
        </a-layout-content>
        <a-layout-footer class="layout-footer">
            <a-button v-if="!isChatFinished" class="send-btn" shape="circle" @click="stopChat"
              :style="{
                  color: inputText.trim()? '#fff' : '#0c0c0c',
              }">
              <svg
                  width="20" height="20" 
                  color="#fff"
              xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M392 432H120a40 40 0 0 1-40-40V120a40 40 0 0 1 40-40h272a40 40 0 0 1 40 40v272a40 40 0 0 1-40 40z" fill="currentColor"></path></svg>
            </a-button>
            <a-button v-else class="send-btn" shape="circle" @click="emitInputText() && sendUserQuestion()"
              :style="{
                  color: inputText.trim()? '#fff' : '#0c0c0c',
              }">
              <svg class="send-icon"
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
        </a-layout-footer>
    </a-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watchEffect, watch } from 'vue'
import { chatEvents } from '../shared/consts'
import { useChatStore } from '../stores'
import { storeToRefs } from 'pinia'
import MicMonitor from './MicMonitor.vue'

const props = defineProps({
    isAlkiInput: {
        type: Boolean,
        default: false
    },
    alkiInput: {
        type: String,
        default: ''
    },
    helpSendText: {
        type:String,
        default:''
    }
})
// **变量**
const textareaAttrs = ref({                       // 输入框属性设置
  spellcheck: false
})
const inputText = ref('')                         // 输入框内容
const emit = defineEmits(['inputTextEvent']);     // 定义事件
let keydownListener                               // 定义按键事件监听器
let userQuestion = ''                             // 保存用户输入内容副本给AI
// **方法**
// 发送输入内容事件
let inputTextObj
const emitInputText = () => {
    const inputTextValue = inputText.value.trim()   // 获取输入框内容
    if (inputTextValue && isChatFinished.value) {   // 如果输入内容不为空且对话已结束
        inputTextObj = {sender:'user' , string: inputTextValue, time: new Date().toLocaleString(), isStop: false, sendStatus: 'wait'}  // 构造输入对象
        userQuestion = inputTextValue               // 保存用户输入内容副本给AI
        inputText.value = ''                        // 清空输入框内容
        //console.log(inputTextObj.id, inputTextObj.string, inputTextObj.time)
        emit('inputTextEvent', inputTextObj)        // 触发事件
        return true
    }
    return false
}
// 添加按键事件监听器
const addKeydownListener = () => {
    keydownListener = (event) => {
        if (event.key === 'Enter' &&!event.ctrlKey &&!event.shiftKey &&!event.altKey &&!event.metaKey) {
            emitInputText() && sendUserQuestion()    // 向主进程发送用户输入内容
            event.preventDefault()                   // 阻止默认行为 比如给输入框换行
        }
    }
    window.addEventListener('keydown', keydownListener);
}
// 移除按键事件监听器
const removeKeydownListener = () => {
    if (keydownListener) {
        window.removeEventListener('keydown', keydownListener);
        keydownListener = null;
    }
}
// 向主进程发送用户输入内容
// 根据selectedChat.value向服务器发送用户输入内容
const store = useChatStore()
const { selectedChat, isChatFinished } = storeToRefs(store)
const sendUserQuestion = async () => {
    const fixedUserId = selectedChat.value.user_id
    if(userQuestion !== '')
    {
        const answerResult = await window.ipcRenderer.invoke(chatEvents.QUESTION, {
        userId: fixedUserId,
        userQuestion: userQuestion
        })
        if (answerResult === true) {  // 成功发送用户输入至服务器
            console.log('接收回答完毕')
        }
        else
        {
            inputTextObj = {...inputTextObj, ...{sendStatus: 'fail', isStop: true}}
            emit('inputTextEvent', inputTextObj)
        }
        userQuestion = ''  // 清空副本
    }
}
// 事件message:isSendSuccess的处理函数
const handleSendSuccess = (event, isSendSuccess) => {
    if (isSendSuccess) {
        inputTextObj = {...inputTextObj, ...{sendStatus: 'success', isStop: true}}
        console.log('用户输入内容已成功发送至服务器')
        emit('inputTextEvent', inputTextObj)
    }
}
// 模型输出过程中停止对话
const stopChat = async () => {
	window.ipcRenderer.send(chatEvents.STOP_CHAT)
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

// 控制麦克风组件关闭释放资源
const isCloseMic = ref(false)

// 处理完所有任务再关闭模态窗 会隐式地自动将visible值设置为false
const handleBeforeOk = async () => {
    isCloseMic.value = true
    // 阻塞等待音频保存完毕
    console.log('In InputArea.vue, 开始阻塞等待语音保存完毕')
    await waitForRecordSaved()
    isRecordSaved.value = false  // 重置保存状态
    console.log('In InputArea.vue, 语音保存完毕')
    // 请求语音识别
    const asrText = await window.ipcRenderer.invoke(chatEvents.ASR)
    console.log('In InputArea.vue, 语音识别结果:', asrText)
    inputText.value = asrText
    return true;
}

// 进入alki模式的交互逻辑
watch( () => props.isAlkiInput, (newVal) => {
    if (newVal) {
        inputText.value = props.alkiInput
        emitInputText()
        sendUserQuestion()
        console.log('进入alki模式', inputText.value)
    }
})

// 帮助其他组件传递用户输入内容
watch( () => props.helpSendText, (newVal) => {
    if (newVal) {
        inputText.value = newVal
        emitInputText()
        sendUserQuestion()
        console.log('进入帮助发送模式', inputText.value)
    }
})

// 在组件创建时注册监听
onMounted(() => {
    window.ipcRenderer.on(chatEvents.IS_SEND_SUCCESS, handleSendSuccess)
})
// 在组件销毁时移除监听
onBeforeUnmount(() => {
    window.ipcRenderer.removeListener(chatEvents.IS_SEND_SUCCESS, handleSendSuccess)
})
</script>

<style scoped>
.layout-input-area {
    /*border: 2px solid #3b4335;*/
    /**var(--content-background-color) */
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    background: var(--content-background-color);
}
.layout-footer {
    /*border: 2px solid #3b4335;*/
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}
.content-input {
    width: 100%;
    height: 100px;
    border: none;
    border-radius: 15px;
    background-color: transparent;
}

/*输入框滚动条样式 */
.content-input :deep(.arco-textarea)::-webkit-scrollbar { /* 修改滚动条样式 */
    width: 0.5rem; /* 滚动条的宽度 */
}
.content-input :deep(.arco-textarea)::-webkit-scrollbar-track {
    background-color: none;
}
.content-input :deep(.arco-textarea)::-webkit-scrollbar-thumb {
    background: #b5b995; /* 滚动条的颜色 */
    border-radius: 10px; /* 滚动条的圆角 */
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
    bottom: -20px;
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
/*发送按钮样式 语音按钮样式*/
.send-btn, .voice-btn {
    width: 39px;
    height: 39px;
    margin-right: 20px;
    margin-bottom: 10px;
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

<style>
/*语音交互模态窗的footer样式 模态窗被挂载到body根节点 scoped中定义样式无效*/
.voice-modal .arco-modal-footer  {
    text-align: center;
    border-top: none;
    padding: 0px;
}
/* 最外层模态窗样式 */
.voice-modal .arco-modal {
    width: 300px;
    height: 280px;
    border-radius: 20px;
}
.voice-modal .arco-modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 10px;
}
</style>