<template>
    <a-list ref="msgList" class="virtual-list-wrapper" :style="{
        width: '100%',
        height: '100%'
    }"
    :virtualListProps="{
      height: '100%',  // 如果单条消息超过height, 会生成出虚拟滚动外额外的滚动条, 设置:scrollbar=‘false’解决
      buffer: 10,       // 此外设置虚拟列表高度为100%后, 设置:scrollbar='false'才有滚动条
    }"
    :data="msgListShow"
    :scrollbar="false"
    @scroll="checkTop"
    >
        <template #empty>
        <!-- 覆盖原来的空数据模板 -->
        </template>
        <template #item="{ item, index }">
            <a-list-item class="message-item" :key="index">
                <div class="message-item-meta" :style="{
                    maxWidth: '80%',
                    alignSelf: item.senderId === chatConsts.LORD_ID ? 'flex-end' : 'flex-start',
                }">
                    <TextBubble v-if="item.senderId === chatConsts.LORD_ID" :message="{string: item.content, sendStatus: item.sendStatus}"></TextBubble>
                    <div v-else>
                        <div class="markdown-voice-translate" :style="{
                            display: 'flex',
                            alignItems: 'flex-end'
                        }">
                            <markdown :textObject="{string: item.content}"></markdown>
                            <div class="voice-translate" :style="{
                                display: 'flex',
                                flexDirection: 'column',
                            }">
                                <VoiceEngineBtn :voiceEngine="item.voicePath" 
                                    :isAutoPlay="item.messageId === messageIdNow"
                                    showSpin 
                                    @gray-voice-btn-clicked="tts(item)">
                                </VoiceEngineBtn>
                                <TranslateBtn :sourceText="item.content" @translated="translated($event)(item)"></TranslateBtn>
                            </div>
                        </div>
                        <markdown :style="{
                            maxWidth: 'calc(100% - 100px)',
                            marginTop: '10px',
                        }" :key=" item.translatedText + item.messageId" v-if="item.translatedText && item.translatedText !== ''" :textObject="{string: item.translatedText}"></markdown>
                        <span :style="{
                            fontSize: '10px',
                            padding: '2px 4px',
                            color: 'black',
                            backgroundColor: 'var(--blue-gray)',
                            borderRadius: '5px',
                        }" v-if="item.translatedText && item.translatedText !== ''">
                            由火山翻译驱动
                        </span>
                    </div>
                </div>
            </a-list-item>
        </template>
    </a-list>
    
</template>

<script setup>
import TextBubble from './TextBubble.vue'
import markdown from './markdown.vue'
import VoiceEngineBtn from './VoiceEngineBtn.vue'
import { ref, computed, watchEffect, onActivated, reactive } from 'vue'
import { chatConsts, chatEvents } from '../shared/consts'
import TranslateBtn from './TranslateBtn.vue'
import { useChatStore } from '../stores'
import { storeToRefs } from 'pinia'

const msgList = ref(null)      // 最外层列表容器, 用以实现跳转到指定位置
const props = defineProps({    // 接收父组件传递的消息列表[ {messageId senderId, content, messageType, voicePath, craetedAt, sendStatus} ]
    messages: {
        type: Array,
        default: () => [],
        required: true
    },
})
const msgListShow = computed(() => {
    // 先按照时间排序 旧->新
    props.messages.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    return reactive(props.messages)  // 让组件数据成为响应式, 随变化更新
})

// 实现滚动到底部
const scrollToBottom = () => {
    if (msgList.value && msgListShow.value.length > 0) {
        const length = msgListShow.value.length
        msgList.value.scrollIntoView({ index: length + length  })
    }
}

// 状态管理
const chatStore = useChatStore()
const { chatMsgList, selectedChat } = storeToRefs(chatStore)
// 获取markdown组件内的消息内容, 并作为tts的文本
const messageIdNow = ref(-1)  // 当前获取的消息id
const tts = async (item) => {
    messageIdNow.value = -1
    // 为消息列表内的消息更新voicePath
    const conversation_id = selectedChat.value.conversation_id
    const chatMsg = chatMsgList.value.find(item_ => item_.conversation_id === conversation_id)
    const message = chatMsg.messages.find(item_ => item_.message_id === item.messageId)
    if (!item.messageId) {  // 还在生成ai消息, 没有message_id 没找到
    }
    else
    {
        if (item.voicePath === '' || item.voicePath === 'error') {
            message.voice_path = 'run'  // 表示正在执行TTS任务
        }

        item.voicePath = await window.ipcRenderer.invoke(chatEvents.TTS, {
            userId: item.senderId,
            messageId: item.messageId,
            text: item.content
        })
        
        if (item.voicePath === '') {
            console.log('In ShowMessage.vue, 合成语音失败')
            message.voice_path = 'error' // 合成语音失败
        }
        else
        {
            message.voice_path = item.voicePath
            messageIdNow.value = item.messageId
        }
    }
}
// 获取翻译文本 使用高阶函数, 同时获取emit传出消息和输入参数
const isTranslating = ref(false)
const translated = (targetText) => (item) =>{
    isTranslating.value = true
    item.translatedText = targetText
    // 为消息列表内的消息更新voicePath
    const conversation_id = selectedChat.value.conversation_id
    const chatMsg = chatMsgList.value.find(item_ => item_.conversation_id === conversation_id)
    const message = chatMsg.messages.find(item_ => item_.message_id === item.messageId)
    message.translated_text = item.translatedText
}

// 滚动到最上方时, 加载新消息
const isScrollToLoadMsg = ref(false)
const checkTop = async () => {
    if (msgList.value) {
        const listContainer = msgList.value.$el.querySelector('.arco-virtual-list')
        const scrollTop = listContainer.scrollTop
        if (scrollTop === 0) {
            // 加载历史消息 先定位当前会话对应的消息列表
            const userId = selectedChat.value.user_id
            const conversation_id = selectedChat.value.conversation_id
            const chatMsg = chatMsgList.value.find(item_ => item_.conversation_id === conversation_id)
            const offset = chatMsg.messages.length
            // 加载历史消息 只有一个id
            const oldChatMsgList = await window.ipcRenderer.invoke(chatEvents.GET_CHAT_MSG_LIST, {userIds: [userId], limit:2, offset: offset})
            if (oldChatMsgList.length > 0) {
                // 同样 chatMsgList 列表也只有一个元素
                const oldChatMsg = oldChatMsgList[0]
                isScrollToLoadMsg.value = true
                // 合并历史消息 修改原数组
                chatMsg.messages.unshift(...oldChatMsg.messages)
                listContainer.scrollTop = 5  // 回退一点, 实现能够再次滚动到顶部, 再次加载历史消息
            }
        }
    }
}

// 监听msgListShow, 实现首次加载时或消息列表变化时, 滚动到底部
watchEffect(() => {
    if (isTranslating.value || isScrollToLoadMsg.value) {
        // 如果是翻译/加载旧消息, 导致消息列表变化, 就不滚动到底部
        isTranslating.value = false
        isScrollToLoadMsg.value = false
    }
    else {
        scrollToBottom()
    }
})

// 这是arco design虚拟列表的bug, 首次滚动虚拟列表到底部后, 再次进入虚拟列表所在组件, 虚拟列表显示空白, 解决: 监听组件激活时, 滚动到底部
onActivated(() => {
    scrollToBottom()
})
</script>

<style scoped>

/* 让每个消息容器的交叉轴为水平轴, 就可以通过align-self来控制子元素的左右对齐方式 */
.message-item :deep(.arco-list-item-content) {
    display: flex;
    flex-direction: column;
}
/*让消息气泡从虚拟列表的底部开始增长 */
.virtual-list-wrapper :deep(.arco-virtual-list.arco-list-content.arco-list-virtual) {
    display: flex;
    flex-direction: column;
}
.virtual-list-wrapper :deep(.arco-virtual-list.arco-list-content.arco-list-virtual  > div) {
    margin-top: auto;
}
/* 改变虚拟列表滚动条样式 */
.virtual-list-wrapper :deep(.arco-virtual-list.arco-list-content.arco-list-virtual)::-webkit-scrollbar  {
    width: 0.5rem; /* 滚动条的宽度 */
}
.virtual-list-wrapper :deep(.arco-virtual-list.arco-list-content.arco-list-virtual)::-webkit-scrollbar-track {
    background-color: transparent;
}
.virtual-list-wrapper :deep(.arco-virtual-list.arco-list-content.arco-list-virtual)::-webkit-scrollbar-thumb {
  background: #abacae; /* 滚动条的颜色 */
  border-radius: 5px; /* 滚动条的圆角 */
  visibility: hidden;
}
.virtual-list-wrapper :deep(.arco-virtual-list.arco-list-content.arco-list-virtual:hover)::-webkit-scrollbar-thumb {
    visibility: visible;
}
.virtual-list-wrapper :deep(.arco-virtual-list.arco-list-content.arco-list-virtual)::-webkit-scrollbar-thumb:hover {
  background: #979898; /* 滚动条的颜色 */
}
/* 让整个虚拟列表的高度跟随父容器 100%*/
.virtual-list-wrapper :deep(.arco-list.arco-list-medium.arco-list-bordered.arco-list-split) {
    height: 100%;
}
.virtual-list-wrapper :deep(.arco-list.arco-list-medium.arco-list-bordered.arco-list-split > .arco-list-content-wrapper) {
    height: inherit;
}

/* 消除每个消息气泡所在表格单元的边框 */
.virtual-list-wrapper :deep(.arco-list-item.message-item) {
    border: none;
}
/*消除虚拟表格的边框 实现:bordered="false"的效果, 因为:bordered="false"会改变flex布局, 所以手动更改 */
.virtual-list-wrapper :deep(.arco-list.arco-list-medium.arco-list-bordered.arco-list-split) {
    border: none;
}
</style>