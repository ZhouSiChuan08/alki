<template>
    <div class="role-profile">
        <div class="role-profile-avatar-wrapper">
            <div class="role-profile-avatar" :class="[{'inactive': !form.avatarUrl}]">
                <img v-if="form.avatarUrl" :src="form.avatarUrl+ '?t=' + Date.now()" alt="avatar" 
                    :style="{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }" />
            </div>
            <!-- 头像裁剪 -->
            <CropImage
                :isSendImg="true"
                :imgSaveFolder="fileNames.AVATAR"
                :options="{dragMode:'move', cropBoxResizable: false, aspectRatio: 1 }"
                :presetMode="{mode:'round', width:300, height:300}"
                :isUseResetBtn="false"
                @imgNameEvent="handleImgAvatar">
            </CropImage>
            <div class="role-profile-post" :class="[{'inactive': !form.postUrl}]">
                <!-- <img v-if="postUrl" :src="postUrl+ '?t=' + Date.now()" alt="avatar" 
                    :style="{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }" /> -->
                <CompressedImage v-if="form.postUrl" :src="form.postUrl+ '?t=' + Date.now()" :scaleRate="0.5"
                    :width="60" :height="80">
                </CompressedImage>
            </div>
            <!-- 海报裁剪 -->
            <CropImage
                :isSendImg="true"
                :imgSaveFolder="fileNames.POST"
                :options="{dragMode:'move', cropBoxResizable: true, aspectRatio: 3/4 }"
                :isUseResetBtn="false"
                @imgNameEvent="handleImgPost">
            </CropImage>
            <!-- <SkeuomorphBtn class="use-profile-btn" shape="round" @click="modalVisible = true">导入配置</SkeuomorphBtn> -->
        </div>
        <!-- 阻止回车提交表单 @keydown.enter.prevent -->
        <a-form ref="formRef" class="role-profile-form" :model="form"  @keydown.enter.prevent @submit="handleSubmit" @submit-success="isValidateSuccess = true">
            <a-form-item field="userName" tooltip="给ta取个名字吧" label="姓名"
                :rules="[{ validator: (_, cb) => {
                    !form.userName.trim() && cb('姓名不能为空')
                }}]">
                <a-input spellcheck="false" v-model="form.userName" placeholder="请输入姓名" />
            </a-form-item>
            <a-form-item field="gender" tooltip="你甚至可以填个沃尔玛购物袋" label="性别"
                :rules="[{ validator: (_, cb) => {
                    (!form.gender && !form.genderOther.trim()) && cb('随便写个性别也行')
                }}]">
                <a-radio-group v-model="form.gender" 
                    :style="{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }">
                    <a-radio value="male" @click="form.genderOther = ''">男</a-radio>
                    <a-radio value="female" @click="form.genderOther = ''">女</a-radio>
                    <a-form-item field="genderOther" label="其他"
                        :style="{
                            margin: '0'
                        }">
                        <a-input spellcheck="false" v-model="form.genderOther" placeholder="请输入性别" 
                            @input="form.gender = ''"/>
                    </a-form-item>
                </a-radio-group>
            </a-form-item>
            <a-form-item field="area" tooltip="也可能不是地球生物" label="地域"
                :rules="[{ validator: (_, cb) => {
                    !form.area.trim() && cb('地域不能为空')
                }}]">
                <a-input spellcheck="false" v-model="form.area" placeholder="" :style="{width: '36%'}"/>
                <a-form-item field="flag" label="旗帜"
                    :style="{
                        margin: '0'
                    }">
                    <div class="role-profile-flag-wrapper">
                        <div class="role-profile-flag">
                            <img v-if="form.flagUrl" :src="form.flagUrl + '?t=' + Date.now()" alt="avatar" 
                                :style="{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }" />
                        </div>
                        <!-- 旗帜裁剪 -->
                        <CropImage
                            :isSendImg="true"
                            :imgSaveFolder="fileNames.FLAG"
                            :options="{dragMode:'move', cropBoxResizable: false, aspectRatio: 1 }"
                            :presetMode="{mode:'round', width:300, height:300}"
                            :isUseResetBtn="false"
                            @imgNameEvent="handleImgNameFlag">
                        </CropImage>
                    </div>
                </a-form-item>
            </a-form-item>
            <a-form-item field="presupposition" tooltip="你想要什么样的ta?" label="预设"
                :rules="[{ validator: (_, cb) => {
                    !form.presupposition.trim() && cb('预设不能为空')
                }}]">
                <a-textarea class="presupposition-textarea" v-model="form.presupposition" placeholder="请输入预设" spellcheck="false"/>
            </a-form-item>
            <a-form-item class="voice-engine-select-wrapper" field="voiceEngine" tooltip="ta说话的音色" label="语音引擎"
                :rules="[{ validator: (_, cb) => {
                    !form.voiceEngine.trim() && cb('语音引擎不能为空')
                }}]">
                <a-select v-model="form.voiceEngine" placeholder="选择语音引擎" allow-clear>
                    <a-option v-for="(voice, index) in voiceList" :value="Object.values(voice)[0]">{{ Object.keys(voice)[0] }}</a-option>
                </a-select>
                <VoiceEngineBtn :voiceEngine="getVoiceMp3Name(form.voiceEngine)"></VoiceEngineBtn>
                <SkeuomorphBtn class="use-profile-btn" shape="round" @click="manageVoiceModalVisible = true">克隆音色</SkeuomorphBtn>
            </a-form-item>
            <div class="handle-btns" :style="{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                marginBottom: '30px'
                }">
                <a-button type="secondary" shape="round" :style="{
                    marginRight: '20px'
                    }" @click="clearForm()">清空
                </a-button>
                <!-- 触发表单提交事件的按钮 按钮必须在form标签内部才能实现点击提交表单 -->
                <a-button type="primary" shape="round" html-type="submit">保存</a-button>
            </div>
            <!-- 最好不要把模态窗放在其他组件内, 否则可能产生某些函数的交互问题, 尽管模态窗挂载到根组件, 本来和其他组件无关联 -->
            <a-modal class="voice-manage" v-model:visible="manageVoiceModalVisible" hideCancel hide-title @cancel="manageVoiceModalVisible = false" unmountOnClose
                    :mask-closable="false"
                    >
                    <div class="voice-manage-switch">
                        <button v-for="btn in voiceManageButtons"
                            :key="btn.text"
                            :class="['voice-manage-switch-button', { 'active': btn.text === activeBtn }]"
                            @click="activeBtn = btn.text">
                            {{ btn.text }}
                        </button>
                    </div>
                    <div v-if="activeBtn === '克隆音色'" clss="voice-clone">
                        <AudioPlayer :samples="100" @audio-file-path="getAudioFilePath"></AudioPlayer>
                        <a-input class="voice-clone-text-input-lines" :disabled="audioFilePath === ''" v-model="spkLines" spellcheck="false" placeholder="音色对应台词, 务必准确" />
                        <div class="voice-clone-btns-input">
                            <a-input class="voice-clone-text-input-name" :disabled="audioFilePath === ''" v-model="spkId" spellcheck="false" placeholder="音色名称" />
                            <a-button type="secondary" shape="round" :style="{
                                marginRight: '20px'
                                }" @click="manageVoiceModalVisible = false; audioFilePath = ''; spkLines = ''; spkId = ''">取消
                            </a-button>
                            <a-button  type="primary" shape="round" @click="cloneVoice">提交</a-button>
                        </div>
                    </div>
                    <div v-else class="voice-delete">
                        <a-list :max-height="180" :bordered="false" :split="false" size="small"  :style="{
                            width: '280px',
                            height: '180px'
                        }">
                            <a-list-item v-for="voice in userVoiceList">
                                <template #meta>
                                    <div class="voice-list-item" :style="{
                                        display: 'flex'
                                    }">
                                        <a-checkbox @change="(checked) => {if(checked) {deleteVoiceList.push(voice.spkId)}}">{{ voice.spkId }}</a-checkbox>
                                    </div>
                                </template>  
                            </a-list-item>
                            <template #empty>
                                <a-empty>
                                    尚未创建任何音色
                                </a-empty>
                            </template>
                        </a-list>
                        <div v-if="userVoiceList.length > 0" :style="{
                            display: 'flex',
                            alignSelf: 'flex-end',
                        }">
                            <a-button  type="secondary" shape="round" :style="{
                                marginTop: '5px',
                                marginRight: '20px'
                            }" @click="manageVoiceModalVisible = false">取消</a-button>
                            <a-button  type="primary" shape="round" :style="{
                                alignSelf: 'flex-end',
                                marginTop: '5px'
                            }" @click="deleteVoice">删除</a-button>
                        </div>
                    </div>
                    <template #footer>
                        <div></div>
                        <!-- 空div可以清空原本的footer -->
                    </template>
            </a-modal>
            <!-- 克隆音色的提示模态窗 -->
            <a-modal class="role-profile-modal" v-model:visible="cloneVoiceInfoVisible" mask hide-cancel :mask-closable="false" 
                :closable = "false" @ok="handleCloneVoiceInfoOk" :ok-loading="isCloneVoiceInfoOkLoading" unmountOnClose :ok-text="''"
                :ok-button-props = "{shape: 'round'}" 
                :modal-style = "{
                    borderRadius: `${sizes.MODAL_BORDERRADIUS}px`,
                    width: `${sizes.MODAL_WIDTH}px`,
                    height: `${sizes.MODAL_HEIGHT}px`,
                }"
                :body-style = "{
                    textAlign: 'center',
                }">
                <template #title>
                    <IconInfoCircleFill style="color: var(--olivine-450);" :size="sizes.MODAL_ICON_SIZE"></IconInfoCircleFill>
                    <span style="margin-left: 5px;">克隆音色</span>
                </template>
                <div style="width: auto; height: 40px; line-height: 40px">
                    {{ cloneVoiceInfoContent }}
                </div>
            </a-modal>
        </a-form>
        
    </div>
    <!-- 以下为测试代码 -->
    <div v-if="false">
        <span>测试表单输入数据 【姓名】：{{ form.userName }}</span>
        <br>
        <span>测试表单输入数据 【性别】: {{ form.gender }} {{ form.genderOther }}</span>
        <br>
        <span>测试表单输入数据 【地域】: {{ form.area }} {{ form.flagUrl }}</span>
        <br>
        <span>测试表单输入数据 【预设】: {{ form.presupposition }}</span>
        <br>
        <span>测试表单输入数据 【语音引擎】: {{ form.voiceEngine }}</span>
    </div>
    <a-modal class="role-profile-modal" v-model:visible="createRoleModalVisible" mask hide-cancel :mask-closable="false" 
        :closable = "false" @ok="handleOk" :ok-loading="isOkLoading" unmountOnClose
        :ok-button-props = "{shape: 'round'}" 
        :modal-style = "{
            borderRadius: `${sizes.MODAL_BORDERRADIUS}px`,
            width: `${sizes.MODAL_WIDTH}px`,
            height: `${sizes.MODAL_HEIGHT}px`,
        }"
        :body-style = "{
            textAlign: 'center',
        }">
        <template #title>
            <IconInfoCircleFill style="color: var(--olivine-450);" :size="sizes.MODAL_ICON_SIZE"></IconInfoCircleFill>
            <span style="margin-left: 5px;">创建角色</span>
        </template>
        <div style="width: auto; height: 40px; line-height: 40px">
            {{ modalContent }}
        </div>
    </a-modal>
</template>

<script setup>
import { reactive, ref, watchEffect, onMounted, computed } from 'vue'
import CropImage from './CropImage.vue'
import SkeuomorphBtn from './SkeuomorphBtn.vue'
import { fileNames, roleEvents } from '../shared/consts'
import { sizes } from '../shared/consts'
import { IconInfoCircleFill } from '@arco-design/web-vue/es/icon'
import CompressedImage from './CompressedImage.vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores'
import { storeToRefs } from 'pinia'
import VoiceEngineBtn from './VoiceEngineBtn.vue'
import AudioPlayer from './AudioPlayer.vue'


// ipc通信 通知主进程更新联系人列表
const reloadContactList = () => {
    window.ipcRenderer.send(roleEvents.UPDATE_CONTACTLIST)
}

const exeDir = import.meta.env.VITE_EXE_DIR  // 获取项目根目录
const formRef = ref(null)                    // 表单ref
const form = reactive({                      // 表单数据对象
    userName: '',
    gender: '',
    genderOther: '',
    avatarUrl: '',
    postUrl: '',
    area: '',
    flagUrl: '',
    presupposition: '',
    voiceEngine: '',
})
const handleImgAvatar = (name) => {          // 图片裁剪组件回调函数
    form.avatarUrl = ''
    form.avatarUrl  = exeDir + 'config/' + fileNames.AVATAR + '/' + name
}                   
const handleImgPost = (name) => {            // 海报图片裁剪组件回调函数
    form.postUrl = ''
    form.postUrl  = exeDir + 'config/' + fileNames.POST + '/' + name
}
const handleImgNameFlag = (name) => {        // 旗帜图片裁剪组件回调函数
    form.flagUrl = ''
    form.flagUrl = exeDir + 'config/' + fileNames.FLAG + '/' + name
}
const isValidateSuccess = ref(false)               // 表单验证是否成功
const handleSubmit = async () => {                 // 表单提交事件回调函数
    if (isValidateSuccess.value === true)          // @submit-success比@submit先触发
    {
        console.log('提交角色配置表单数据', form)
        isValidateSuccess.value = false
        if (reEditUesrId.value) {                       // 重新编辑角色
            let jsonForm = JSON.stringify(form)         // 必须将表单对象转为json字符串 因为form是响应对象,无法被克隆传递给主进程
            const jsonFormObj = JSON.parse(jsonForm)
            jsonFormObj['userId'] = reEditUesrId.value  // 添加userId属性
            jsonForm = JSON.stringify(jsonFormObj)
            const isSuccess = await window.ipcRenderer.invoke(roleEvents.RE_EDIT_ROLE_PROFILE, jsonForm)
            createRoleModalVisible.value = true
            if (isSuccess) {
                isOkLoading.value = false
                modalContent.value = '角色更新成功'
                reloadContactList()  // 通知主进程更新联系人列表
            }
            else
            {
                isOkLoading.value = false
                modalContent.value = '角色更新失败'
            }
            console.log('角色配置表单提交结果', isSuccess)
        }
        else                                           // 创建新角色
        {
            const jsonForm = JSON.stringify(form)      // 必须将表单对象转为json字符串 因为form是响应对象,无法被克隆传递给主进程
            const isSuccess = await window.ipcRenderer.invoke(roleEvents.ADD_ROLE_PROFILE, jsonForm)
            createRoleModalVisible.value = true
            if (isSuccess) {
                isOkLoading.value = false
                modalContent.value = '角色创建成功'
                reloadContactList()  // 通知主进程更新联系人列表
            }
            else
            {
                isOkLoading.value = false
                modalContent.value = '角色创建失败'
            }
            console.log('角色配置表单提交结果', isSuccess)
        }
        clearForm()  // 清空表单
    }
    else
    {
        console.log('角色配置表单验证失败')
    }
}
// 清空表单
const clearForm = () => {
    formRef.value.resetFields()  // 根据fields属性名寻找form.fields的字段并清空 所以fields和form.xxx必须一致
    form.avatarUrl = ''
    form.postUrl = ''
    form.flagUrl = ''
}
// 创建角色的创建状态信息弹窗
const createRoleModalVisible = ref(false)   // 弹窗是否可见
const isOkLoading = ref(true)     // 弹窗确定按钮是否处于加载状态
const modalContent = ref('正在创建角色配置信息,请稍后...')
const handleOk = () => {          // 弹窗确定按钮事件回调函数
    createRoleModalVisible.value = false
}

const reEditUesrId = ref(null)  // 要重新编辑的用户ID
// 状态管理
const store = useChatStore()
const { contactList } = storeToRefs(store)  // 解构出状态 state
// 获取路由查询参数 userId 重新编辑角色配置
const route = useRoute()
watchEffect(() => {
    if (route.path === '/sub/create-role/') {
        if (route.query.userId) {
            reEditUesrId.value = Number(route.query.userId)
            console.log('In RoleProfile.vue, 要重新编辑的用户 id: ', reEditUesrId.value)
            const selectedContact = contactList.value.find(item => item.user_id === reEditUesrId.value)
            if (selectedContact) {
                // 将现有状态内的数据填充到表单
                form.userName = selectedContact.user_name
                if(selectedContact.gender === 'male' || selectedContact.gender === 'female')
                {
                    form.gender = selectedContact.gender
                }
                else
                {
                    form.genderOther = selectedContact.gender
                }
                form.avatarUrl = selectedContact.avatar_url
                form.postUrl = selectedContact.post_url
                form.area = selectedContact.area
                form.flagUrl = selectedContact.flag_url
                form.presupposition = selectedContact.presupposition
                form.voiceEngine = selectedContact.voice_engine
            }
        }
    }
})

// 创建角色的创建状态信息弹窗
const cloneVoiceInfoVisible = ref(false)   // 弹窗是否可见
const isCloneVoiceInfoOkLoading = ref(true)     // 弹窗确定按钮是否处于加载状态
const cloneVoiceInfoContent = ref('正在克隆, 请稍后...')
const handleCloneVoiceInfoOk = () => {          // 弹窗确定按钮事件回调函数
    cloneVoiceInfoVisible.value = false
}

// 模态窗内页面切换按钮
const voiceManageButtons = ref([
    {text: '克隆音色'},
    {text: '删除音色'},
])
const activeBtn = ref('克隆音色')
// 音色克隆组件
const audioFilePath = ref('')
const spkLines = ref('')
const spkId = ref('')
// 音频文件路径回调函数
const getAudioFilePath = (path) => {
    audioFilePath.value = path
}
const manageVoiceModalVisible = ref(false)
// 克隆音色
const sysVoiceList = ['沉稳男声', '低沉男声', '磁性男声', '沉稳女声', '温柔女声']
const cloneVoice = async () => {
    cloneVoiceInfoContent.value = '正在克隆, 请稍后...'
    if (audioFilePath.value && spkId.value && spkLines.value) {
        if (spkId.value.length > 10) {
            alert('音色名称长度不能超过10字符')
            return
        }
        if (spkId.value === '沉稳男声' || spkId.value === '低沉男声' || spkId.value === '磁性男声' || spkId.value === '沉稳女声' || spkId.value === '温柔女声' ) {
            alert(`不准使用系统内置音色：${spkId.value}`)   
            return
        }
        cloneVoiceInfoVisible.value = true
        isCloneVoiceInfoOkLoading.value = true
        const isSuccess = await window.ipcRenderer.invoke(roleEvents.MANAGE_VOICE, {spkId: spkId.value, spkLines: spkLines.value, audioFilePath: audioFilePath.value, action: 'clone'})
        getVoiceList();
        if (isSuccess) {
            cloneVoiceInfoContent.value = '音色克隆成功'
        }
        else
        {
            cloneVoiceInfoContent.value = '音色克隆失败'
        }
        isCloneVoiceInfoOkLoading.value = false

        manageVoiceModalVisible.value = false
        audioFilePath.value = ''
        spkId.value = ''
        spkLines.value = ''
    }
    else
    {
        alert('请选择音频文件、输入台词对白和音色名称')
    }
}
// 查询本地音色列表 加载用户音色
const voiceList = ref([])
const userVoiceList = computed(() => {  // [{'spkId': XX, 'voiceId': XX}, {...}, {...}, ...]
    let list = []
    for (let index = 0; index < voiceList.value.length; index++) {
        let isSysVoice = false
        for (let i = 0; i < sysVoiceList.length; i++)
        {
            if (Object.keys(voiceList.value[index])[0] === sysVoiceList[i]) {
                isSysVoice = true
                break
            }
        }
        if (!isSysVoice) {
            list.push({spkId: Object.keys(voiceList.value[index])[0], voiceId: Object.values(voiceList.value[index])[0]})
        }
    }
    return list
})
// 这里会查询到所有音色
const getVoiceList = async () => {
    const voiceListData = await window.ipcRenderer.invoke(roleEvents.MANAGE_VOICE, {spkId: '', spkLines: '', audioFilePath: '', action: 'list'})  // 不是字符串类型
    voiceList.value = voiceListData
    // [{'spkId1': 'voiceId1'}, {'spkId2': 'voiceId2'}, ...]
}
// 删除音色 全是spkId
const deleteVoiceList = ref([])
const deleteVoice = async () => {
    if (deleteVoiceList.value.length > 0) {
        const deleteVoiceListStr = JSON.stringify(deleteVoiceList.value)
        const isSuccess = await window.ipcRenderer.invoke(roleEvents.MANAGE_VOICE, {spkId: deleteVoiceListStr, spkLines: '', audioFilePath: '', action: 'delete'})
        getVoiceList();
    }
    manageVoiceModalVisible.value = false
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

// 组件加载时, 获取本地音色列表
onMounted(() => {
    getVoiceList()
})
</script>

<style scoped>
/*让外围容器和form宽度保持相同*/
.role-profile,
.role-profile-form {
    width: 500px;
    --border-radius: 8px;
    --margin-bottom: 20px;
}
.role-profile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
/*头像显示区外侧容器*/
.role-profile-avatar-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    margin-left: 20px;
    margin-top: 20px;
}
/*头像显示区*/
.role-profile-avatar {
    width: 80px;
    height: 80px;
    border: 2px solid var(--blue-gray);
    border-radius: 50%;
    position: relative;
}
.role-profile-avatar.inactive::after {
    font-weight: bold;
    color: var(--olivine-450);
    content: "头像";
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
}
/*海报展示区*/
.role-profile-post {
    width: 60px;
    height: 80px;
    border: 2px solid var(--blue-gray);
    margin-left: 20px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}
.role-profile-post.inactive::after {
    font-weight: bold;
    color: var(--olivine-450);
    content: "海报";
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
}
/*包括裁剪按钮的容器*/
.role-profile-avatar-wrapper :deep(section),
.role-profile-flag-wrapper :deep(section) {
    margin-left: 20px;
}
.role-profile-avatar-wrapper :deep(.select-picture-btn),
.role-profile-flag-wrapper :deep(.select-picture-btn) {
    width: 40px;
    height: 40px;
    background: var(--blue-gray);
    border: none;
    border-radius: 50%;
    color: var(--olivine-450);
    font-size: 22px;
}
.role-profile-avatar-wrapper :deep(.select-picture-btn):hover,
.role-profile-flag-wrapper :deep(.select-picture-btn):hover {
    color: white;
}
.role-profile-form {
    margin-top: 20px;
}
/*表单内每个整体的行元素 */
.role-profile-form :deep(.arco-row) {
    align-items: center;
    margin-bottom: var(--margin-bottom);
    position: relative;
}
/* 表单内验证提示信息的样式 为避免生成的提示信息拉长输入框高度,影响label文字布局,直接将其脱离文档流定位*/
.role-profile-form :deep(.arco-form-item-message) {
    position: absolute;
    bottom: -20px;
}
/*表单内每个行元素的label */
.role-profile-form :deep(.arco-form-item-label) {
    font-weight: bold;
    font-size: 15px;
}
/*表单内每个行元素的输入框外侧span容器 */
.role-profile-form :deep(.arco-input-wrapper) {
    border: 2px solid var(--blue-gray);
    border-radius: var(--border-radius);
    background: none;
}
/*选中表单内每个行元素的输入框外侧span容器 */
.role-profile-form :deep(.arco-input-wrapper):focus-within {
    border: 2px solid var(--olivine-450);
}
.role-profile-form :deep(.arco-icon-hover.arco-radio-icon-hover)::before {
    width: 20px;
    height: 20px;
}
/*预设内容文本框*/
.presupposition-textarea {
    background: none;
    border: 2px solid var(--blue-gray);
    border-radius: var(--border-radius);
    width: 100%;
    height: 6em;
    resize: none;
}
.presupposition-textarea:focus-within {
    border: 2px solid var(--olivine-450);
}
/*输入框滚动条样式 */
.presupposition-textarea :deep(.arco-textarea) {
    resize: none;
}
.presupposition-textarea :deep(.arco-textarea)::-webkit-scrollbar { /* 修改滚动条样式 */
  width: 8px; /* 滚动条的宽度 */
}
.presupposition-textarea :deep(.arco-textarea)::-webkit-scrollbar-track {
  background-color: none;
}
.presupposition-textarea :deep(.arco-textarea)::-webkit-scrollbar-thumb {
  background: #dae2a9; /* 滚动条的颜色 */
  border-radius: 5px; /* 滚动条的圆角 */
}
.presupposition-textarea :deep(.arco-textarea)::-webkit-scrollbar-thumb:hover {
  background: #a1a777; /* 滚动条的颜色 */
}
/*旗帜显示区外侧容器*/
.role-profile-flag-wrapper {
    display: flex;
    align-items: center;
}
/*旗帜显示区*/
.role-profile-flag {
    width: 40px;
    height: 40px;
    border: 2px solid var(--blue-gray);
    border-radius: 50%;
}
/*语音引擎选择框*/
.voice-engine-select-wrapper :deep(.arco-select-view) {
    background: none;
    border: 2px solid var(--blue-gray);
    border-radius: var(--border-radius);
    width: 50%;
}
.voice-engine-select-wrapper :deep(.arco-select-view):focus-within {
    border: 2px solid var(--olivine-450);
}
/*语音引擎试听按钮*/
.voice-listen-btn:hover svg{
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--success-450);
}
.voice-listen-btn.playing {
    color: var(--success-450) !important;
}
/*音频条容器样式*/
.voice-bars {
    border: none;
    margin-left: 10px;
    overflow: hidden;
    border-radius: 0%;
}
/*直接导入已有配置按钮*/
.use-profile-btn {
    margin-left: auto;
    font-weight: bold;
    /*outline: 2px solid rgb(178, 200, 158);*/
    outline: 2px solid rgb(190, 190, 190);
    box-shadow: inset 0 -3em 3em rgba(0,0,0,0.1),
             0 0  0 2px rgb(190, 190, 190),
             0.3em 0.3em 1em rgba(0,0,0,0.3);
}
</style>

<style>
/* 重置arco-design组件样式 */
/*消除单选器内,各选项li的左外边距*/
.arco-select-dropdown-list-wrapper ul {
  margin-left: 0px;
}
/*改变选中时的背景色*/
.arco-select-dropdown-list-wrapper .arco-select-option-active {
  background: var(--olivine-450);
  font-weight: bolder;
}
/* 让创建角色模态窗内按钮居中 模态窗不属于组件内部元素 没有data-v-xxx属性 须在外style设置样式*/
.arco-modal-container.role-profile-modal .arco-modal-footer {
  text-align: center;
}
</style>

<style>
/*语音交互模态窗的footer样式 模态窗被挂载到body根节点 scoped中定义样式无效*/
.voice-manage .arco-modal-footer  {
    text-align: center;
    border-top: none;
    padding: 0px;
}
/* 最外层模态窗样式 */
.voice-manage .arco-modal {
    width: 350px;
    height: 280px;
    border-radius: 20px;
}
.voice-manage .arco-modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
    padding-left: 0px;
    padding-right: 0px;
    padding-bottom: 5px;
}
/* 模态窗页脚 */
.voice-manage .arco-modal-footer {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
/* 模态窗内文本输入框 */
.voice-manage .arco-input-wrapper.voice-clone-text-input-lines {
    width: 300px;
    border: 2px solid var(--blue-gray);
    border-radius: 8px;
    background: none;
    margin-top: 5px;
}
.voice-manage .arco-input-wrapper.voice-clone-text-input-name {
    width: 100px;
    border: 2px solid var(--blue-gray);
    border-radius: 8px;
    background: none;
    margin-right: auto;
}
.voice-manage .arco-input-wrapper:focus-within {
    border: 2px solid var(--olivine-450);
}
/* 模态页音色名称输入框及取消/提交按钮 */
.voice-manage .voice-clone-btns-input {
    display: flex;
    width: 300px;
    margin-top: 5px;
}
/* 更改placeholder字体颜色 */
.voice-manage .arco-input::placeholder {
    color: gray;
}
/* 更改模态窗内切换按钮样式 */
.voice-manage-switch {
    display: flex;
    justify-content: start;
}
.voice-manage-switch-button {
    margin-right: 30px;
    margin-bottom: 5px;
    background: transparent;
    border: none;
    font-size: 18px;
    font-weight: bold;
}
.voice-manage-switch-button:hover {
    cursor: pointer;
}
.voice-manage-switch-button::after {
    content: '';
    display: block;
    width: 100%;
    height: 3px;
    background: var(--olivine-450);
    border-radius: 3px;
    transform: scaleX(0);  /* 初始状态隐藏 */
}
.voice-manage-switch-button.active::after {
    transform: scaleX(1);  /* 鼠标悬停时显示 */
}
.voice-manage-switch-button.active {
    color: var(--olivine-450);
}
/* 删除音色界面样式 */
.voice-delete {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>