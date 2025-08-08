<template>
  <a-layout class="layout">
    <a-layout-content class="layout-content">
      <!-- 欢迎语 -->
      <div class="content-msg-welcome">
          <p>Choose and say somthing...</p>
      </div>
      <!-- 卡片轮播 -->
      <div class="content-cards">
          <CardCarousel :cards="roles"></CardCarousel>
      </div>
    </a-layout-content>
    <a-layout-footer class="layout-footer">
      <InputText @inputTextEvent="onInputTextEvent"></InputText>
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import CardCarousel from '../CardCarousel.vue'
import { useChatStore } from '../../stores'
import { storeToRefs } from 'pinia'
import InputText from '../InputText.vue'
import { toolFuns } from '../../shared/toolFuns'
import router from '../../router'
import { chatEvents, chatConsts } from '../../shared/consts'
import { Message } from '@arco-design/web-vue'

const defaultRoles = [
  {  name: 'alki', description: '' , type: 'undefined'},  // props示例
  {  name: 'alki', description: '' , type: 'undefined'},
  {  name: 'alki', description: '' , type: 'undefined'},
]
// 状态管理
const chatStore = useChatStore()
const { contactList } = storeToRefs(chatStore)
const { selectChat } = chatStore
const loadRoles = ref([])
const roles = computed(() => {
  loadRoles.value = []
  if (contactList.value.length > 0) {
    contactList.value.forEach(item => {
      loadRoles.value.push({
        id: item.user_id, name: item.user_name, 
        flagUrl: item.flag_url, postUrl: item.post_url,
        type: 'defined'
      })
    })
  }
  if (contactList.value.length < 3) 
  {
    const diff = 3 - contactList.value.length
    // console.log('diff:',diff)
    for (let i = 0; i < diff; i++) {
      loadRoles.value.push(defaultRoles[i])
    }
    return loadRoles.value
  }
  else
  {
    return loadRoles.value
  }
})

// 先随机选定联系人, 再改变路由跳转页面, 再发送消息
const onInputTextEvent = async (text) => {
    if (contactList.value.length >= 1) {
        const randomIndex = toolFuns.randomInt(0, contactList.value.length - 1);
        const contact = contactList.value[randomIndex]
        selectChat(contact)                                           // 将选中联系人设置为当前会话
        console.log('onInputTextEvent:', contact.user_name)
        await window.ipcRenderer.invoke(chatEvents.MAKE_CHAT, {userId: contact.user_id, userName: contact.user_name, type: chatConsts.SINGLE})  // 创建会话
        router.push({ name: 'chat', params: { voice: undefined, randomChatText: text } })    // 跳转到聊天页面
    }
    else {
        Message.warning('尚未创建任何人物')
    }
}


</script>

<style scoped>
/*布局样式*/
.layout {
  /*border: 2px solid rgb(232, 206, 37);*/
  width: 100%;
  height: 100%;
  position: relative;
}
/*主体内容样式*/
.layout-content {
  /*border: 2px solid rgb(32, 186, 88);*/
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/*欢迎语*/
.content-msg-welcome {
  margin-bottom: 4rem;
  color: var(--text-olvine-450);
  text-align: center;
  font-size: 3rem;
  font-weight: bolder;
}
/*卡片轮播*/
.content-cards {
  align-self: center;
  margin-bottom: 4rem;
}
/*布局底部 原本是block, 改成flex*/
.layout-footer {
  /*border: 2px solid rgb(19, 132, 197);*/
  display: flex;
  flex-direction: column;
  margin-bottom: 12vh;
}
</style>