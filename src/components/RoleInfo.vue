<template>
    <div class="role-info-wrapper" :class="{ 'visiable': isVisiable}">
        <div class="role-info-post">
            <CompressedImage :src="roleInfo.postUrl" :scaleRate="0.5"
                :width="postSizeWidth" :height="postSizeHeight">
            </CompressedImage>
        </div>
        <div class="role-info-info">
            <div class="role-info-colum">
                <span class="role-info-label">姓名</span>
                <span class="role-info-value">{{ roleInfo.name }}</span>
            </div>
            <div class="role-info-colum">
                <span class="role-info-label">性别</span>
                <span class="role-info-value">{{ roleInfo.gender }}</span>
            </div>
            <div class="role-info-colum">
                <span class="role-info-label">地区</span>
                <span class="role-info-value">{{ roleInfo.area }}</span>
            </div>
            <div class="role-info-colum role-info-voice">
                <span class="role-info-label">语音引擎</span>
                <span class="role-info-value">{{ getSpkId(roleInfo.voiceEngine) }}</span>
                <VoiceEngineBtn :voiceEngine="getVoiceMp3Name(roleInfo.voiceEngine)"></VoiceEngineBtn>
            </div>
            <div class="role-info-colum">
                <span class="role-info-label">人设</span>
                <span class="role-info-value">{{ roleInfo.presupposition }}</span>
            </div>
            <div class="fun-btns-wrapper">
                <button class="fun-btn" @click="wantTextChat();makeChat()">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"><g fill="none"><path d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a7.95 7.95 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8zm0 1a7 7 0 0 0-6.106 10.425a.5.5 0 0 1 .063.272l-.014.094l-.756 3.021l3.024-.754a.502.502 0 0 1 .188-.01l.091.021l.087.039A7 7 0 1 0 10 3zm.5 8a.5.5 0 0 1 .09.992L10.5 12h-3a.5.5 0 0 1-.09-.992L7.5 11h3zm2-3a.5.5 0 0 1 .09.992L12.5 9h-5a.5.5 0 0 1-.09-.992L7.5 8h5z" fill="currentColor"></path></g></svg>
                    <span>发消息</span>
                </button>
                <button class="fun-btn" @click="wantVoiceChat();makeChat()">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M14.755 15a2.249 2.249 0 0 1 2.248 2.249v.575c0 .895-.32 1.76-.9 2.439C14.532 22.096 12.145 23 9 23s-5.532-.905-7.098-2.74a3.75 3.75 0 0 1-.898-2.434v-.578A2.249 2.249 0 0 1 3.253 15h11.502zm0 1.5H3.252a.749.749 0 0 0-.75.749v.578c0 .535.192 1.053.54 1.46c1.253 1.468 3.22 2.214 5.957 2.214c2.739 0 4.706-.746 5.963-2.214a2.25 2.25 0 0 0 .54-1.463v-.575a.749.749 0 0 0-.748-.749zm4.3-15.096a.75.75 0 0 1 1.023.279A12.694 12.694 0 0 1 21.75 8c0 2.254-.586 4.424-1.683 6.336a.75.75 0 1 1-1.301-.746A11.194 11.194 0 0 0 20.25 8c0-1.983-.513-3.89-1.475-5.573a.75.75 0 0 1 .28-1.023zM9 3.004a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm6.589.396a.75.75 0 0 1 1.023.28A8.713 8.713 0 0 1 17.75 8c0 1.538-.398 3.02-1.143 4.328a.75.75 0 1 1-1.304-.743A7.213 7.213 0 0 0 16.25 8a7.213 7.213 0 0 0-.942-3.578a.75.75 0 0 1 .28-1.022zM9 4.505a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7z" fill="currentColor"></path></g></svg>
                    <span>alki</span>
                </button>
                <a-dropdown position="bottom" class="role-info-fun-btn-dropdown">
                    <button class="fun-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z" fill="currentColor"></path></svg>
                        <span>其他</span>
                    </button>
                    <template #content>
                        <a-doption>
                            <div class="role-info-fun-btn-dropdown-item">
                                <a-button  class="role-info-fun-btn-dropdown-item-btn" @click="reEditContact">
                                    <template #icon>
                                        <svg :style="{
                                        width: '20px',
                                        height: '20px',
                                    }"xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M14.855 15.5l1.5-1.5H6.253a2.249 2.249 0 0 0-2.25 2.25v.577c0 .892.32 1.756.9 2.435c1.395 1.634 3.442 2.531 6.097 2.707c-.004-.183.016-.37.064-.561l.23-.924c-2.373-.12-4.108-.858-5.251-2.196a2.25 2.25 0 0 1-.54-1.461v-.578c0-.413.336-.749.75-.749h8.602zM12 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zm7.1 9.165l-5.903 5.902a2.686 2.686 0 0 0-.706 1.247l-.458 1.831a1.087 1.087 0 0 0 1.319 1.318l1.83-.457a2.685 2.685 0 0 0 1.248-.707l5.902-5.902A2.286 2.286 0 0 0 19.1 12.67z" fill="currentColor"></path></g></svg>
                                    </template>
                                    <span>编辑人物</span>
                                </a-button>
                            </div>
                        </a-doption>
                        <hr style="opacity: 0.5;">
                        <a-doption>
                            <div class="role-info-fun-btn-dropdown-item">
                                <a-button  class="role-info-fun-btn-dropdown-item-btn delete" @click="deleteContact();updateChatState()">
                                    <template #icon>
                                        <svg :style="{
                                        width: '20px',
                                        height: '20px',
                                    }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"><g fill="none"><path d="M5 6a4 4 0 1 1 8 0a4 4 0 0 1-8 0zm4-3a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM2 13c0-1.113.903-2 2.009-2h6.248a5.503 5.503 0 0 0-.657 1H4.009C3.448 12 3 12.447 3 13c0 1.309.622 2.284 1.673 2.953C5.743 16.636 7.265 17 9 17c.2 0 .398-.005.592-.015c.173.342.381.662.618.958c-.395.038-.8.057-1.21.057c-1.855 0-3.583-.386-4.865-1.203C2.833 15.967 2 14.69 2 13zm17 1.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0zm-2.646-1.146a.5.5 0 0 0-.708-.708L14.5 13.793l-1.146-1.147a.5.5 0 0 0-.708.708l1.147 1.146l-1.147 1.146a.5.5 0 0 0 .708.708l1.146-1.147l1.146 1.147a.5.5 0 0 0 .708-.708L15.207 14.5l1.147-1.146z" fill="currentColor"></path></g></svg>
                                    </template>
                                    <span>删除人物</span>
                                </a-button>
                            </div>
                        </a-doption>
                    </template>
                </a-dropdown>
            </div>
        </div>
    </div>
    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VoiceEngineBtn from './VoiceEngineBtn.vue'
import CompressedImage from './CompressedImage.vue'
import { useChatStore } from '../stores'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { chatEvents, chatConsts, roleEvents, subWindowEvents, sizes } from '../shared/consts'

const isVisiable = ref(false)
const exeDir = import.meta.env.VITE_EXE_DIR                                  // 程序运行目录
const defaultPostUrl = exeDir + 'config/post/defaultPost/Male/MalePost4.png' // 默认头像图片路径
const scale = 1.5
const postSizeWidth = 150 * scale
const postSizeHeight = 200 * scale

const props = defineProps({
    roleInfo: {
        type: Object,
        default: () => ({
            name: '',
            voiceEngine: '',
            postUrl: '',
            gender: '',
            area: '',
            presupposition: '',
        })
    }
})
const roleInfo = computed(() => {
    if (props.roleInfo.gender) {
        if (props.roleInfo.gender === 'male') {
            props.roleInfo.gender = '男'
        }
        else if (props.roleInfo.gender === 'female') {
            props.roleInfo.gender = '女'
        }
    }
    // console.log(props.roleInfo)
    return{
        ...props.roleInfo,
        ...{
            name: props.roleInfo.name || '未知角色',
            voiceEngine: props.roleInfo.voiceEngine || '未知语音引擎',
            postUrl: props.roleInfo.postUrl || defaultPostUrl,
            gender: props.roleInfo.gender || '未知性别',
            area: props.roleInfo.area || '未知地区',
            presupposition: props.roleInfo.presupposition || '未知人物介绍',

        }
    }
})

// 状态管理
const store = useChatStore()
const { selectedContact, selectedChat } = storeToRefs(store)
const { selectChat, loadContactList, loadChatList } = store

// 路由配置
const router = useRouter()
// 根据选中联系人选中会话
// 发起文字聊天
const wantTextChat = () => {
    console.log('In RoleInfo.vue, 发起文字会话 变更selectedChat:', selectedContact.value)
    selectChat(selectedContact.value) // 将选中联系人设置为当前会话
    router.push({name: 'chat'})       // 跳转到聊天页面
}
// 发起语音聊天
const wantVoiceChat = () => {
    console.log('In RoleInfo.vue, 发起文字会话 变更selectedChat:', selectedContact.value)
    selectChat(selectedContact.value) // 将选中联系人设置为当前会话
    router.push({name: 'chat', params: {voice: true}})       // 跳转到聊天页面
}

// ipc事件
// 点击[发消息]创建会话
const makeChat = async () => {
    console.log('In RoleInfo.vue, 请求创建会话表')
    const isSuccess = await window.ipcRenderer.invoke(chatEvents.MAKE_CHAT, {userId: selectedContact.value.user_id, userName: selectedContact.value.user_name, type: chatConsts.SINGLE})
    console.log('In RoleInfo.vue, 创建会话表或插入新会话状态:', isSuccess)
}
// 点击[其他]-[删除人物] 删除联系人
const deleteContact = () => {
    if (selectedContact.value) {
        console.log('In RoleInfo.vue, 请求删除联系人：', selectedContact.value.user_id, selectedContact.value.user_name)
        window.ipcRenderer.send(roleEvents.DELETE_CONTACT, selectedContact.value.user_id)
    }
}
// 删除联系人后, 同步更新状态量
// 更新联系人
const updateContactList = async () => {
  const roleProfilesJsonArray = await window.ipcRenderer.invoke(roleEvents.GET_ROLE_PROFILES)
  if (roleProfilesJsonArray.length > 0) {
        console.log('In RoleInfo.vue, 更新联系人列表 roleProfilesJsonArray', roleProfilesJsonArray)
        loadContactList(roleProfilesJsonArray)
  }
  else {
    loadContactList(roleProfilesJsonArray)
  }
}
// 更新会话表
const updateChatList = async () => {
    const chatListJsonArray = await window.ipcRenderer.invoke(chatEvents.GET_CHAT_LIST)
    if (chatListJsonArray.length > 0) {
        console.log('In RoleInfo.vue, 更新会话列表, chatListJsonArray', chatListJsonArray)
        loadChatList(chatListJsonArray)
    }
    else{
        // 所有会话都被删除, 填入返回的空数组
        loadChatList(chatListJsonArray)
        console.log('In RoleInfo.vue, chatListJsonArray.length is 0')
    }
}
const updateChatState = () => {
    console.log('In RoleInfo.vue, 同步更新状态量')
    // 设置当前选择联系人为null
    const userId = selectedContact.value.user_id
    selectedContact.value = null
    updateContactList()
    updateChatList()
    // 如果当前会话恰好是要删除的联系人, 则清空当前会话
    if (selectedChat.value && selectedChat.value.user_id === userId) {
        selectedChat.value = null
    }
}

// 打开创建角色子窗口 附加联系人id
const makeSubWindowWithUserId = (userId) => {
    userId = String(userId)
    window.ipcRenderer.send(subWindowEvents.MAKE_ROLE, {
        options: {
            width:sizes.SUB_WINDOW_WIDTH,
            height:sizes.SUB_WINDOW_HEIGHT,
            resizable: false,
            routerPath: `/sub/create-role/?userId=${userId}`
        }, 
    })
}
// 重新编辑联系人
const reEditContact = () => {
    makeSubWindowWithUserId(selectedContact.value.user_id)
}

// 查询本地音色列表 加载用户音色
const voiceList = ref([])

// 这里会查询到所有音色
const getVoiceList = async () => {
    const voiceListData = await window.ipcRenderer.invoke(roleEvents.MANAGE_VOICE, {spkId: '', spkLines: '', audioFilePath: '', action: 'list'})  // 不是字符串类型
    voiceList.value = voiceListData
    // [{'spkId1': 'voiceId1'}, {'spkId2': 'voiceId2'}, ...]
}

// 试听组件获取音色对应音频文件名
const getSpkId = (voiceId) => {
    if (voiceId) {
        for (let index = 0; index < voiceList.value.length; index++) {
            if (Object.values(voiceList.value[index])[0] === voiceId) {
                return Object.keys(voiceList.value[index])[0]   
            }
        }
    }
    return ''
}

// 试听组件获取音色对应音频文件名
const getVoiceMp3Name = (voiceId) => {
    if (voiceId) {
        for (let index = 0; index < voiceList.value.length; index++) {
            if (Object.values(voiceList.value[index])[0] === voiceId) {
                return exeDir + 'config/tts/' + Object.values(voiceList.value[index])[1]   
            }
        }
    }
    return ''
}


onMounted(() => {
    setTimeout(() => {
        isVisiable.value = true
    }, 80)  // 解决渲染闪烁
    getVoiceList()
})

</script>

<style scoped>
.role-info-wrapper {
    width: 600px;
    height: 400px;
    margin: 100px auto;

    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto;
    gap: 40px;
    grid-auto-rows: min-content;
    background: var(--color-ivory-light);
    visibility: hidden;
}
.role-info-wrapper.visiable {
    visibility: visible;
}
.role-info-post {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    background: #97c374;

    box-shadow: inset 0 -3em 3em rgba(0,0,0,0.1),
             0 0  0 5px rgb(228, 222, 222),
             0.3em 0.3em 1em rgba(0,0,0,0.3);
    height: fit-content;
    overflow: hidden;
    align-self: center;
}
.role-info-info {
    display: block;
    align-self: center;     /*在grid中实现垂直居中 */
    --info-font-size: 13px;
}
.role-info-colum {
    display: flex;
    align-items: start;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 0.5px solid var(--blue-gray);
}
/*让语音按钮和文字垂直居中 */
.role-info-colum.role-info-voice {
    align-items: center;
}
.role-info-label {
    display: inline-block;
    font-size: var(--info-font-size);
    color: gray;
    min-width: 100px;
    text-align: start;
}
.role-info-value {
    font-size: var(--info-font-size);
    max-width: 200px;
}
.fun-btns-wrapper {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 30px;
}
.fun-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    color: var(--olivine-450);
    width: 50px;
    height: 50px;
}
.fun-btn > svg {
    width: 30px;
    height: 30px;
}
.fun-btn > span {
    font-size: 10px;
}
.fun-btn:hover {
    background: rgb(255, 255, 255, 0.2);;
}
</style>

<style>
/*消除下拉菜单内 ul项左外边距 */
.role-info-fun-btn-dropdown ul {
    margin-left: 0;
}
/* 设置父容器为透明背景 */
.role-info-fun-btn-dropdown .arco-dropdown {
    background: transparent;
    padding: 0px;
}
/* 设置下拉菜单为透明背景 */
.role-info-fun-btn-dropdown-item .role-info-fun-btn-dropdown-item-btn {
    background: transparent;
}

.role-info-fun-btn-dropdown-item .role-info-fun-btn-dropdown-item-btn:hover {
    color: var(--olivine-450);
    background: transparent;
}
.role-info-fun-btn-dropdown-item .role-info-fun-btn-dropdown-item-btn.delete:hover {
    color: var(--rust-450);
}
.role-info-fun-btn-dropdown-item:hover {
    background: rgb(255, 255, 255, 0.2);
}
/* 清除doption的左右内边距 */
.role-info-fun-btn-dropdown .arco-dropdown-option{
    padding: 0px;
}
/* 清除doption的光标悬浮背景色 */
.role-info-fun-btn-dropdown .arco-dropdown-option:hover{
    background: transparent;
}
</style>