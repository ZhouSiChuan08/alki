<template>
    <a-list style="user-select: none ;" class="chat-list" max-height="92vh" :bordered="false">
        <template #empty>
            <a-empty>
                暂无会话
            </a-empty>
        </template>
        <a-list-item v-if="chatListSorted.length > 0" v-for="(item, index) in chatListSorted"
            :class="[{'active': item.key === selectedKey}]"
            @click="selectedKey = item.key">
            <a-list-item-meta>
                <template #avatar>
                    <!-- 禁止拖拽头像 -->
                    <a-avatar style=" pointer-events: none;" shape="circle" :size="avatarSize" v-if="item.avatarUrl" :image-url="item.avatarUrl">
                    </a-avatar>
                    <svg class="avatar-icon" v-else :style="{width: avatarSize+'px', height: avatarSize+'px'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M16 8a5 5 0 1 0 5 5a5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3z" fill="currentColor"></path><path d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2zm-6 24.377V25a3.003 3.003 0 0 1 3-3h6a3.003 3.003 0 0 1 3 3v1.377a11.899 11.899 0 0 1-12 0zm13.992-1.451A5.002 5.002 0 0 0 19 20h-6a5.002 5.002 0 0 0-4.992 4.926a12 12 0 1 1 15.985 0z" fill="currentColor"></path></svg>
                </template>
                <template #title>
                    <div class="chat-name-date">
                        <span class="chat-name">{{ item.name }}</span>
                        <span class="chat-date">{{ item.hourMinute }}</span>
                    </div>
                </template>
            </a-list-item-meta>
        </a-list-item>
    </a-list>
    <!-- <a-button type="primary" shape="round" @click="test">测试</a-button> -->
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { toolFuns } from '../shared/toolFuns'
import { useChatStore } from '../stores'
import { storeToRefs } from 'pinia'

// 测试用
const test = () => {
    console.log('selectedContact: ', selectedContact.value)
    console.log('selectedChat: ', selectedChat.value)
    console.log('selectedKey:', selectedKey.value)
    console.log('chatListSorted:', chatListSorted.value)
    console.log('chatList:', chatList.value)
    console.log('chatMsgList:', chatMsgList.value)
}

const avatarSize = 42          // 头像尺寸
const selectedKey = ref(null)  // 选中的会话索引
// 外部输入会话列表
const props = defineProps({
    chatList: {
        type: Array,
        default: () => [
            // { name: '张三', avatarUrl: './img/pic1.jpg'},  // props 示例
            // { name: '李四', avatarUrl: ''},
            // { name: '张三', avatarUrl: ''},  // props 示例
            // { name: '李四', avatarUrl: ''},
            // { name: '张三', avatarUrl: ''},  // props 示例
            // { name: '李四', avatarUrl: ''},
            // { name: '张三', avatarUrl: ''},  // props 示例
            // { name: '李四', avatarUrl: ''},
            // { name: '张三', avatarUrl: ''},  // props 示例
            // { name: '李四', avatarUrl: ''},
            // { name: '张三', avatarUrl: ''},  // props 示例
            // { name: '李四4', avatarUrl: ''}, // 最新结构👇
            // { id: chat.user_id, name: chat.user_name, avatarUrl: chat.avatar_url, updatedAt: chat.updated_at}
        ]
    }
})
// 计算属性, 对输入会话列表进行排序, 再渲染到列表中
const chatListSorted = computed(() => {
    // 添加key键
    let chatListWithKey = toolFuns.addIndexToArr(props.chatList)
    // 按时间排序 + 增加日期戳2020/01/01 + 增加时分戳00:00
    chatListWithKey = chatListWithKey.map(item => {
        const updatedAt = new Date(item.updatedAt)
        const year = updatedAt.getFullYear().toString().slice(-2)
        const month = (updatedAt.getMonth() + 1).toString()
        const day = updatedAt.getDate().toString()
        const hour = toolFuns.utcHourToLocal(updatedAt.getHours(), 8).toString().padStart(2, '0')
        const minute = updatedAt.getMinutes().toString().padStart(2, '0')
        const yearMonthDay = `${year}/${month}/${day}`
        const hourMinute = `${hour}:${minute}`
        return {
            ...item,
            yearMonthDay: yearMonthDay,
            hourMinute: hourMinute,
        }
    })
    chatListWithKey.sort((a, b) => {
        // 将时间字符串转换为Date对象的时间戳进行比较
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    return chatListWithKey
})

// 状态管理
const store = useChatStore()
const { selectedChat, contactList, chatList, chatMsgList, selectedContact } = storeToRefs(store)
const { selectChat } = store
// 监听选中的会话(发生在联系人界面), 更新selectedKey
watchEffect(() => {
  if (selectedChat.value) {
    const _selectedChat = chatListSorted.value.find(chat => chat.id === selectedChat.value.user_id)
    selectedKey.value = _selectedChat?.key
    console.log('In ChatList.vue, 会话/会话索引/chatListSorted变更触发副作用 更新selectedKey')
  }
  else {
    // 当前选中会话对应联系人被删除, 则重置selectedKey 会话索引
    selectedKey.value = null
  }
})
// 监听选中的会话索引(发生在聊天界面), 更新selectedChat
watch(selectedKey, (newVal) => {
    if (newVal !== null) {
        const _selectedChat = chatListSorted.value.find(chat => chat.key === newVal)
        const _selectedContact = contactList.value.find(contact => contact?.user_id === _selectedChat?.id)
        if (_selectedContact) {
            selectChat(_selectedContact)
            console.log('In ChatList.vue, 会话索引变更触发副作用 更新selectedChat')
        }
    }
})

</script>

<style scoped>
/* 默认头像样式 */
.avatar-icon {
    color: var(--text-olvine-450);
}
/*缩小每个条目的内边距*/
.chat-list :deep(.arco-list-content > .arco-list-item) {
    padding: 5px 5px;
    border-bottom: none;
}
/* 鼠标悬停时改变背景色 */
.chat-list :deep(.arco-list-content > .arco-list-item):hover {
    background-color: var(--color-neutral-2)
}
.chat-list :deep(.arco-list-content > .arco-list-item.active) {
    background-color: var(--color-neutral-3)
}
/* 改变鼠标悬停在标题(姓名)上的光标样式为普通箭头 */
.chat-list :deep(.arco-list-item-meta-title) {
    cursor: default;
    user-select: none; /* 防止选中文字 */
    width: 130px;
    height: 40px;
}
.chat-list :deep(.arco-list-item-meta-title) .chat-name-date {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
}
/* 标题插槽内 姓名和日期样式 */
.chat-list :deep(.arco-list-item-meta-title) .chat-name {
    font-size: 15px;
}
.chat-list :deep(.arco-list-item-meta-title) .chat-date {
    font-size: 11px;
    color: rgb(151, 145, 145);
}
/* 把每个组的圆角矩形边框撤销 */
.chat-list :deep(.arco-list) {
    border-radius: 0;
}
</style>