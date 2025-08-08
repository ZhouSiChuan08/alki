<template>
    <a-list style="user-select: none ;" max-height="92vh" :bordered="false" class="contact-list">
        <template #empty>
            <a-empty>
                尚未添加任何联系人
            </a-empty>
        </template>
        <a-list class="contact-group" :bordered="false" v-for="(group, letter) in groupContactList"
            :key="letter">
            <template #header>
                {{ letter }}
            </template>
            <a-list-item v-if="sortedContactList.length > 0"
                v-for="(item, index) in group"
                :class="[{'active': item.key === selectedKey}]"
                @click="selectedKey = item.key; selectContactByClick(item.id)">
                <a-list-item-meta
                    :title="item.name">
                    <template #avatar>
                        <!-- 禁止拖拽头像 -->
                        <a-avatar style=" pointer-events: none;"  shape="circle" :size="avatarSize" v-if="item.avatarUrl" :image-url="item.avatarUrl">
                        </a-avatar>
                        <svg class="avatar-icon" v-else :style="{width: avatarSize+'px', height: avatarSize+'px'}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M16 8a5 5 0 1 0 5 5a5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3z" fill="currentColor"></path><path d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2zm-6 24.377V25a3.003 3.003 0 0 1 3-3h6a3.003 3.003 0 0 1 3 3v1.377a11.899 11.899 0 0 1-12 0zm13.992-1.451A5.002 5.002 0 0 0 19 20h-6a5.002 5.002 0 0 0-4.992 4.926a12 12 0 1 1 15.985 0z" fill="currentColor"></path></svg>
                    </template>
                </a-list-item-meta>
            </a-list-item>
        </a-list>
    </a-list>
</template>

<script setup>
import { ref, computed, watchEffect} from "vue"
import { pinyin } from "pinyin-pro"
import * as wanakana from 'wanakana'
import { romanize } from '@romanize/korean'
import { toolFuns } from "../shared/toolFuns"
import { useChatStore } from "../stores"
import { storeToRefs } from "pinia"

const avatarSize = 42          // 头像尺寸
const selectedKey = ref(null)  // 选中的联系人索引

const props = defineProps({
    contactList: {
        type: Array,
        default: () => [
            // {id: 12, name: '张三', avatarUrl: './config/roleName/pic1.png'},  输入数据示例
            // {id: 24, name: '李四'},
            // {id: 21, name: '李世民'},
            // {id: 25, name: '李嘉诚'},
            // {id: 37, name: '王五'},
            // {id: 41, name: 'Jack'},
            // {id: 50, name: 'うらら'},
            // {id: 62, name: '김정은'},
            // {id: 74, name: '大卫'},
            // {id: 71, name: '5卫'},
            // {id: 78, name: '6卫'},
            // {id: 78, name: '？卫'},
        ]
    }
})

// 对联系人数组进行排序A-Z
const sortedContactList = computed(() => {
    let contactListCopy = [...props.contactList]
    contactListCopy.sort((a, b) => {
        const afirstUpper = getFirstAlphaByLangType(a.name)
        const bfirstUpper = getFirstAlphaByLangType(b.name)
        // 最后比较
        return afirstUpper.charCodeAt(0) - bfirstUpper.charCodeAt(0)
    })
    contactListCopy  = toolFuns.addIndexToArr(contactListCopy)  // 添加属性key索引
    return contactListCopy
})
// 再根据首字母分组
const groupContactList = computed(() => {
    const group = {}
    sortedContactList.value.forEach(item => {
        const firstAlpha = getFirstAlphaByLangType(item.name)
        if(!group[firstAlpha]){
            group[firstAlpha] = []
        }
        group[firstAlpha].push(item)
    })
    // 把#组放最后
    if ('#' in group) {
        const otherCharGroup = group['#']       // #组
        delete group['#']                       // 删除#组
        return {...group, '#': otherCharGroup}
    }
    return group
})

// 状态管理

// 根据输入字符串首个字符的语言类型, 获取对应罗马字母
const getFirstAlphaByLangType = (str) => {
    str = str.trim()
    const char = str.charAt(0)
    const langType = toolFuns.getLanguageType(char)
    if (langType === 'chinese') {
        const firstAlpha = pinyin(char, { toneType: 'none' })[0]
        return toolFuns.convertToUpper(firstAlpha)
    }
    else if (langType === 'japanese') {
        const firstAlpha = wanakana.toRomaji(char)[0]
        return toolFuns.convertToUpper(firstAlpha)
    }
    else if (langType === 'korean') {
        const firstAlpha = romanize(char, { system: 'MR' })[0]
        return toolFuns.convertToUpper(firstAlpha)
    }
    else if (langType === 'english') {
        return char.toUpperCase()
    }
    else {
        return '#'   // 其他语言类型, 取#
    }
}
// 状态管理 确定选中的联系人
const store = useChatStore()
const { contactList, selectedContact } = storeToRefs(store)
const { selectContact } = store
const selectContactByClick = (id) => {
    contactList.value.forEach(item => {
        if (item.user_id === id) {
            selectContact(item)
            console.log('In ContactList.vue, 当前选中的联系人：', item)
        }
    })
}
// 当前选择联系人被删除后, 重置选中联系人索引
watchEffect(() => {
    if (selectedContact.value === null) {
        selectedKey.value = null
    }
})
</script>

<style scoped>
/* 消除四周边框 仅保留底部边框*/
.contact-group {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
/* 把首字母所在容器的内边距缩小 字体缩小*/
.contact-group :deep(.arco-list-header) {
    padding: 10px 0 0 20px;
    font-size: 15px;
    border-bottom: none;
}
.avatar-icon {
    color: var(--text-olvine-450);
}
/* 改变联系人条目的容器内边距 组合选择器提高特殊性 */
.contact-group :deep(.arco-list-content > .arco-list-item) {
    padding: 5px 5px;
    border-bottom: none;
    border-radius: 0px;
}
/* 鼠标悬停时改变背景色 */
.contact-group :deep(.arco-list-content > .arco-list-item):hover {
    background-color: var(--color-neutral-2)
}
/* 选中联系人时改变背景色 */
.contact-group :deep(.arco-list-content > .arco-list-item.active) {
    background-color: var(--color-neutral-3)
}
/* 改变鼠标悬停在标题(姓名)上的光标样式为普通箭头 */
.contact-group :deep(.arco-list-item-meta-title) {
    cursor: default;
    user-select: none;   /* 取消选中文本 */
}
/* 把每个组及内部元素的圆角矩形边框撤销 */
.contact-group :deep(.arco-list) {
    border-radius: 0px;
}
.contact-list :deep(.arco-scrollbar-container.arco-list.arco-list-medium.arco-list-split) {
    border-radius: 0px;
}
</style>