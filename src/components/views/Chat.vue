<template>
    <a-layout class="chat-wrapper">
        <a-layout-sider class="chat-sider">
            <!-- 联系人列表 -->
            <ChatList :chatList="chatListShow"></ChatList>
        </a-layout-sider>
        <a-layout v-if="selectedChat" class="chat-main">
            <!-- 聊天界面 Header -->
            <a-layout-header class="chat-header">
                <span>{{ selectedChat.user_name || '' }}</span>
                <a-button class="chat-header-btn-alki" shape="round" @click="talkNow" :style="{
                    marginLeft: 'auto',
                    marginRight: '20px',
                }">
                    <svg  :style="{
                        width: '20px',
                        height: '20px',      
                    }" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" ><path stroke="currentColor" stroke-width="0.4"  d="M14.755 15a2.249 2.249 0 0 1 2.248 2.249v.575c0 .895-.32 1.76-.9 2.439C14.532 22.096 12.145 23 9 23s-5.532-.905-7.098-2.74a3.75 3.75 0 0 1-.898-2.434v-.578A2.249 2.249 0 0 1 3.253 15h11.502zm0 1.5H3.252a.749.749 0 0 0-.75.749v.578c0 .535.192 1.053.54 1.46c1.253 1.468 3.22 2.214 5.957 2.214c2.739 0 4.706-.746 5.963-2.214a2.25 2.25 0 0 0 .54-1.463v-.575a.749.749 0 0 0-.748-.749zm4.3-15.096a.75.75 0 0 1 1.023.279A12.694 12.694 0 0 1 21.75 8c0 2.254-.586 4.424-1.683 6.336a.75.75 0 1 1-1.301-.746A11.194 11.194 0 0 0 20.25 8c0-1.983-.513-3.89-1.475-5.573a.75.75 0 0 1 .28-1.023zM9 3.004a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm6.589.396a.75.75 0 0 1 1.023.28A8.713 8.713 0 0 1 17.75 8c0 1.538-.398 3.02-1.143 4.328a.75.75 0 1 1-1.304-.743A7.213 7.213 0 0 0 16.25 8a7.213 7.213 0 0 0-.942-3.578a.75.75 0 0 1 .28-1.022zM9 4.505a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7z" fill="currentColor"></path></g></svg>
                </a-button>
                <a-button class="chat-header-btn-delete" shape="round" @click="showDeleteMsg" :style="{
                    marginRight: '20px',
                    fontWeight: 'bold',
                }">
                    <svg  :style="{
                        width: '20px',
                        height: '20px',
                    }" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"></path><path d="M11 11a1 1 0 0 1-1-1m0-3.968V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10l-3-3h-3"></path><path d="M14 15v2a1 1 0 0 1-1 1H6l-3 3V11a1 1 0 0 1 1-1h2"></path></g></svg>
                    <!-- <span>
                        清空上下文
                    </span> -->
                </a-button>
            </a-layout-header>
            <!-- 聊天界面 content -->
            <a-layout-content class="chat-content" ref="chatContentRef">
                <!-- 消息显示界面 -->
                <ShowMessage class="chat-show" :messages="msgListShow"></ShowMessage>
            </a-layout-content>
            <!-- 聊天界面 footer -->
            <a-layout-footer class="chat-footer">
                <InputArea @inputTextEvent="onInputTextEvent" :isAlkiInput="isAlkiInput" :alkiInput="alkiInput" :helpSendText="helpSendText"></InputArea>
            </a-layout-footer>
        </a-layout>
        <a-layout class="chat-back" v-else>
            <svg   viewBox="0 0 1200 600"
                :style="{
                    position: 'absolute',
                    width: '50%',
                    height: 'auto',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.1,
                }"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <path fill-rule="evenodd"  fill="var(--olivine-450)"
                d="M406.926,-0.000 C479.887,-1.246 459.687,103.601 446.232,153.811 C430.467,212.641 414.710,268.166 393.825,321.239 C385.763,339.896 377.699,358.559 369.637,377.216 C366.446,383.603 363.253,389.992 360.062,396.379 C363.925,407.305 367.789,418.233 371.652,429.159 C382.921,457.236 397.119,491.862 423.556,503.291 C461.260,519.591 490.065,462.932 501.662,440.253 C512.760,418.552 522.894,396.402 532.905,372.677 C537.272,361.920 541.640,351.159 546.007,340.402 C546.175,320.232 546.343,300.056 546.511,279.886 C552.129,227.679 545.710,178.036 555.077,130.614 C555.749,121.369 556.421,112.122 557.093,102.877 C561.258,79.404 562.930,53.775 568.179,31.771 C570.821,20.693 570.049,7.370 578.761,2.521 C581.442,1.030 586.696,0.436 590.351,1.513 C607.218,6.480 596.862,42.660 593.375,59.003 C588.643,81.176 588.908,104.934 584.808,129.101 C582.000,145.654 579.997,162.006 580.777,178.522 C581.051,184.327 579.389,198.328 578.257,203.737 C577.585,232.311 576.913,260.894 576.241,289.468 C576.577,289.300 576.913,289.132 577.249,288.964 C579.501,281.994 585.055,275.996 588.839,270.304 C611.282,236.551 635.798,205.987 676.016,190.121 C701.062,180.241 735.689,184.765 749.084,202.728 C791.141,259.131 724.366,322.606 687.103,344.941 C677.212,350.869 659.969,355.186 651.325,361.583 C651.493,361.919 651.661,362.255 651.829,362.591 C683.513,376.507 709.425,419.032 733.463,442.775 C742.798,451.996 761.116,460.229 776.295,450.844 C793.104,440.451 804.768,418.748 813.081,399.909 C832.930,354.928 848.857,305.594 864.480,254.671 C869.246,239.137 875.540,181.158 898.243,189.112 C902.749,190.691 907.606,194.854 908.825,199.703 C910.823,207.653 903.124,243.341 901.266,253.158 C891.449,305.040 884.474,403.451 912.352,439.245 C923.179,453.146 942.206,449.697 953.169,438.740 C975.671,416.253 990.984,383.623 1003.561,351.497 C1007.239,342.102 1011.731,322.469 1027.748,327.290 C1030.900,328.239 1034.103,329.491 1035.811,331.829 C1043.930,342.945 1027.227,373.143 1022.205,382.763 C1005.532,414.704 992.214,448.057 963.247,467.485 C953.872,473.774 939.843,481.814 922.430,478.076 C884.266,469.882 874.000,435.866 866.496,396.884 C865.488,383.605 864.480,370.322 863.473,357.044 C863.473,357.380 863.473,357.716 863.473,358.053 C859.778,367.633 856.081,377.217 852.386,386.798 C844.502,405.402 835.402,423.627 825.175,440.253 C806.147,471.186 767.311,500.845 724.896,474.546 C709.416,464.947 697.638,448.424 686.599,434.202 C660.495,400.571 629.370,375.065 576.745,373.686 C576.577,374.022 576.409,374.358 576.241,374.694 C578.761,409.992 581.281,445.300 583.800,480.597 C586.329,496.348 587.550,514.286 573.722,517.411 C558.178,520.924 557.972,506.629 556.085,495.222 C553.734,467.488 551.382,439.746 549.030,412.013 C548.694,412.181 548.358,412.349 548.022,412.517 C545.252,426.222 534.705,440.860 528.370,452.357 C510.019,485.657 491.139,524.763 449.759,534.557 C392.497,548.111 350.733,473.230 340.914,433.193 C340.410,433.529 339.906,433.866 339.402,434.202 C336.422,443.727 329.727,452.035 324.788,459.921 C309.817,483.828 294.262,510.261 268.350,522.958 C241.002,536.359 213.587,529.729 198.306,509.342 C182.680,488.497 178.874,459.292 173.110,428.150 C171.935,414.199 170.759,400.244 169.583,386.293 C169.583,386.629 169.583,386.966 169.583,387.302 C164.208,400.580 158.832,413.863 153.458,427.142 C138.638,462.315 117.499,503.060 88.453,524.471 C65.067,541.710 32.983,542.660 16.393,517.915 C1.361,495.494 -3.727,448.825 2.787,412.013 C14.652,344.965 31.896,278.524 76.359,244.081 C108.507,219.177 154.794,214.136 183.692,246.602 C187.799,243.967 193.108,242.033 199.314,244.081 C213.835,248.873 210.640,267.090 207.376,282.912 C196.532,335.485 195.238,410.127 209.392,460.425 C215.827,483.291 225.195,512.570 255.752,496.735 C279.972,484.183 301.438,444.136 314.206,419.073 C318.909,410.164 323.613,401.253 328.316,392.345 C325.964,382.932 323.612,373.517 321.261,364.104 C316.228,342.606 316.987,319.019 313.198,295.519 C313.198,281.737 313.198,267.950 313.198,254.167 C316.628,231.442 314.703,205.152 318.741,183.565 C330.889,118.634 337.997,41.281 382.738,10.086 C390.000,5.023 398.142,4.058 406.926,-0.000 ZM433.634,7.060 L434.642,7.564 L433.634,7.060 ZM410.454,28.745 C404.323,32.167 398.178,33.787 393.825,38.831 C356.913,81.593 347.215,171.564 342.425,246.602 C340.685,273.859 341.698,301.116 345.953,324.769 C347.128,332.501 348.304,340.235 349.480,347.967 C349.648,347.630 349.816,347.294 349.984,346.958 C362.988,328.104 370.390,297.978 378.707,274.843 C396.593,225.095 412.012,172.478 424.059,115.989 C428.772,93.894 439.700,29.483 410.454,28.745 ZM902.274,94.304 C942.601,92.955 930.217,149.489 897.235,142.717 C879.543,139.084 874.180,116.230 886.653,102.877 C890.816,98.420 896.372,97.197 902.274,94.304 ZM703.732,213.823 C691.687,218.536 681.254,218.609 671.481,224.413 C638.717,243.872 619.760,275.573 600.429,308.631 C594.356,319.018 586.453,330.720 582.792,342.924 C583.128,342.924 583.464,342.924 583.800,342.924 C593.155,345.810 616.210,340.347 625.625,337.881 C666.641,327.137 702.972,305.214 722.377,272.826 C735.030,251.706 739.115,213.693 703.732,213.823 ZM129.774,252.150 C121.588,255.384 113.707,254.316 107.097,258.201 C59.987,285.894 43.740,350.364 32.014,413.525 C26.848,441.354 29.089,499.104 48.140,507.325 C66.391,515.201 88.440,482.383 95.004,472.528 C122.193,431.705 139.246,383.679 156.985,332.838 C159.974,324.270 173.903,285.662 172.606,278.878 C165.903,263.916 148.481,255.555 129.774,252.150 ZM759.162,482.110 C759.330,482.446 759.498,482.783 759.666,483.119 C759.834,482.783 760.002,482.446 760.170,482.110 C759.834,482.110 759.498,482.110 759.162,482.110 Z"/>
            </svg>
        </a-layout>
    </a-layout>
    <!-- 语音通话模态窗 -->
     <a-modal class="alki-modal" ref="alkiModalRef" v-model:visible="voiceModalVisible" mask  :mask-closable="false" 
        closable fullscreen  unmountOnClose @before-close="handleAlkiModalBeforeClose" :mask-style="{
            opacity: 0,
            transition: 'opacity 1.5s ease'
        }">
        <template #title>
            <!-- 用空的title把关闭按钮挤到最右侧 -->
        </template>
        <template #footer>
            <div></div>
            <!-- 空div可以清空原本的footer -->
        </template>
        <Vue3Lottie :animationLink="voiceAnimation" :height="300" :width="200" :style="{
            transform: isChatFinished? `scale(1)` : `scale(1.5)`,
            transition: 'transform 1s ease',
            position: 'absolute',
            top: '10%',
            
        }"/>
        <MicMonitor v-if="!isAsrFinished"  :isCloseMic="isCloseMic" @record-saved="isRecordSaved = true" @error-occured="isErrorOccured = true"></MicMonitor>
        <AudioAutoPlayer v-else :voiceEngine="mp3Path" @audio-playing="isAudioPlaying = true" @audio-stop="isAudioPlaying = false; isStopPlaying = false" :stop-audio="isStopPlaying"></AudioAutoPlayer>
        <div class="alki-modal-btns" :style="{
            width: '250px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent:'space-between',
        }">
            <a-button :class="[isCloseMic? '' : 'alki-modal-btn-recording', isAsrAllowed? '' : 'alki-modal-btn-record-not-allowed'    ]" type="secondary" shape="round" :style="{
                width: '100px',
                height: '50px',
            }" @click="voiceInputControl">
                <template #icon>
                    <IconVoice v-if="isCloseMic" :size="50"></IconVoice>
                    <IconRecordStop v-else :size="50"></IconRecordStop>
                </template>
            </a-button>
            <a-button :class="[
                isAudioPlaying? 'alki-modal-btn-stop-enable' : 'alki-modal-btn-stop-disable', 
                isChatFinished? '': 'alki-modal-btn-stop-thinking' 
            ]" type="secondary" shape="round" :style="{
                width: '100px',
                height: '50px',
            }" @click="audioPlayControl">
                <template #icon>
                    <IconStop v-if="isChatFinished" :size="50"></IconStop>
                    <a-spin v-if="!isChatFinished" :size="5" class="alki-modal-btn-spin" dot />
                </template>
                <span v-if="!isChatFinished" :style="{
                    fontWeight: 'bold',
                    fontSize: '20px',
                 }">思考中</span>
            </a-button>
        </div>
    </a-modal>
    <!-- 清空消息模态窗 -->
    <a-modal class="model-setting-modal" v-model:visible="deleteModalVisible" mask  :mask-closable="false" 
        :closable = "false" @ok="handleDeleteOk" unmountOnClose
        :ok-button-props = "{shape: 'round'}"
        :cancel-button-props = "{shape: 'round'}"
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
            <span style="margin-left: 5px;">清空会话</span>
        </template>
        <div style="width: auto; height: 40px; line-height: 40px">
            {{ modalContent }}
        </div>
    </a-modal>
</template>

<script setup>
import InputArea from '../InputArea.vue'
import ChatList from '../ChatList.vue'
import { onMounted, onBeforeUnmount, computed, watch, ref, nextTick, watchEffect } from 'vue'
import { chatEvents } from '../../shared/consts'
import { useChatStore } from '../../stores'
import { storeToRefs } from 'pinia'
import { chatConsts } from '../../shared/consts'
import { dealerIDs } from '../../shared/consts'
import ShowMessage from '../ShowMessage.vue'
import { IconInfoCircleFill, IconVoice, IconRecordStop, IconStop } from '@arco-design/web-vue/es/icon'
import { sizes } from '../../shared/consts'
import { Vue3Lottie } from 'vue3-lottie'
import MicMonitor from '../MicMonitor.vue'
import AudioAutoPlayer from '../AudioAutoPlayer.vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'

// 发送行为贯穿行为发生至发送状态确定, 期间会有多次emit, 但向主进程的通信只需要发送一次
let isNeedPushLordMsg = true                  // 记录是否创建新的消息, 而不是更改已有消息
let fixedConversationId = null                // 记录当前会话的id, 避免把A会话的消息推送到B会话中
let fixedSenderId = null
const onInputTextEvent = (inputTextObj) => {  // 监听输入框发送内容事件 并更新store
    const { string, sendStatus } = inputTextObj
    console.log(`In Chat.vue, 提取到用户输入: ${string}`, inputTextObj)
    // 先把用户临时消息渲染到输入框 将消息推入chatMsgList中对应的会话
    if (isChatFinished.value) {
        fixedConversationId  = selectedChat.value.conversation_id
        fixedSenderId        = selectedChat.value.user_id
        isChatFinished.value = false
    }
    const index = chatMsgList.value.findIndex(chatMsg => chatMsg.conversation_id === fixedConversationId)
    const chatMsg = {
        conversation_id: fixedConversationId, 
        messages: [{
            sender_id: chatConsts.LORD_ID, 
            content: string, 
            message_type: 'text', 
            created_at: new Date().toLocaleString(), 
            isTemporary: true,  // 还没存到数据库, 标记为临时消息
            send_status: sendStatus
        }]
    }
    if (index === -1) {  // 如果不存在该会话, 则创建会话
        addChatMsg(chatMsg)
        console.log('In Chat.vue, 新建临时会话, 并推入chatMsgList中')
        isNeedPushLordMsg = false  // 创建会话的同时就插入了消息(构造chatMsg定义了messages属性), 所以本次消息状态确定前不需要再插入
    }
    else
    {
        // 已有会话, 新建或更新消息
        if (isNeedPushLordMsg) {  // 插入新消息
            chatMsgList.value[index].messages.push(chatMsg.messages[0])
            isNeedPushLordMsg = false
        }
        else {  // 更新已有消息
            // 变更用户发送消息的状态
            const messages = chatMsgList.value[index].messages;
            const lastIndex = messages.length - 1;
            messages[lastIndex].send_status = inputTextObj.sendStatus;  // 更新发送状态
        }
    }   
    // ipc事件 把消息发送给主进程, 请求后端创建消息记录
    if (inputTextObj.isStop === true && inputTextObj.sendStatus === 'success') {  // 这表示传输状态的确定,将消息存入数据库
        // 包装消息体
        const msgObj = { 
            conversationId: fixedConversationId, 
            senderId: chatConsts.LORD_ID,
            content: string,
            messageType: 'text',
        }
        window.ipcRenderer.invoke(chatEvents.MAKE_MSG, {msgObj: msgObj, dealerID: dealerIDs.MakeMsgLord})
        isNeedPushLordMsg = true
    }
    else if(inputTextObj.isStop === true && inputTextObj.sendStatus === 'fail'){
        // 上次发送失败, 下次新建消息
        isNeedPushLordMsg = true
        isChatFinished.value    = true
    }    
}



// 接收主进程传来的Ai答案
let completeAiReply = ''    // 记录下完整的一次Ai回复, 用以保存到数据库
let isNeedPushAiMsg = true  // 记录是否创建新的Ai消息, 而不是更改已有消息
const mp3Name = ref('')     // 记录Alki模式下, 当前Ai回复的语音文件名
const mp3Path = ref('')     // 记录Alki模式下, 当前Ai回复的语音文件路径
const handleMessagePartAnswer = async (event, partAnswer) => {
    if (partAnswer === "END") 
    {
        // 包装消息体
        const msgObj = { 
            conversationId: fixedConversationId, 
            senderId: fixedSenderId,
            content: completeAiReply,
            messageType: 'text',
        }
        //await new Promise((resolve) => setTimeout(resolve, 1000));  // 阻塞1秒, 等待lord消息存储完毕
        const remainMsgAttri = await window.ipcRenderer.invoke(chatEvents.MAKE_MSG, {msgObj: msgObj, dealerID: dealerIDs.MakeMsgAi})
        // 使用 reMainMsgAttri 补全缺失的消息属性: message_id, voice_path
        // 在状态管理中定位当前会话 追加Ai回复
        const index = chatMsgList.value.findIndex(chatMsg => chatMsg.conversation_id === fixedConversationId) // 找到当前会话的索引
        if (index > -1) {
            // 更改已有消息
            const messages = chatMsgList.value[index].messages;
            const lastIndex = messages.length - 1;
            messages[lastIndex].message_id = remainMsgAttri.message_id;  // 更新消息id
            messages[lastIndex].voice_path = remainMsgAttri.voice_path;  // 更新语音路径 在转换前为空

             // 处于Alki模式, 则合成并播放语音
            if (isAlki.value) {
                mp3Name.value = await window.ipcRenderer.invoke(chatEvents.TTS, {
                    userId: msgObj.senderId,
                    messageId: messages[lastIndex].message_id,
                    text: msgObj.content
                })
                // 同时仿照ShowMessage.vue的语音播放逻辑, 在状态管理中更新语音路径
                messages[lastIndex].voice_path = mp3Name.value
                mp3Path.value = voiceDir + mp3Name.value
            }
        }
        completeAiReply = ''
        isNeedPushAiMsg = true
        isChatFinished.value = true
    }
    else
    {
        completeAiReply += partAnswer
        // 定位当前会话 追加Ai回复
        const index = chatMsgList.value.findIndex(chatMsg => chatMsg.conversation_id === fixedConversationId) // 找到当前会话的索引
        if (index > -1) {
            // 组装消息对象
            const aiMsgObj = {
                sender_id: fixedSenderId,
                content: completeAiReply,
                message_type: 'text',
                created_at: new Date().toLocaleString(),
                voice_path: '',
            }
            if (isNeedPushAiMsg) {  // 插入新消息
                isNeedPushAiMsg = false
                chatMsgList.value[index].messages.push(aiMsgObj)   
            }
            else {  // 更改已有消息
                const messages = chatMsgList.value[index].messages;
                const lastIndex = messages.length - 1;
                messages[lastIndex].content = completeAiReply;  // 更新消息内容
            }
        }
    }
}

// 状态管理
const chatStore = useChatStore()
const { selectedChat, chatList, chatMsgList, isChatFinished } = storeToRefs(chatStore)
const {  loadChatList, loadChatMsgList, addChatMsg, clearChatMsg } = chatStore
// watch 用于触发副作用: 用户选中了一个会话
watch(selectedChat, () => {
    // 如果选中的会话在会话列表不存在, 则刷新加载会话列表 
    if (selectedChat.value && !chatList.value.some(chat => chat.user_id === selectedChat.value.user_id)) {
        console.log('In Chat.vue, 会话列表不存在选中会话, 重新加载会话列表')
        updateChatList()  // 重新加载会话列表
    }
})
// 计算属性 只负责计算 无副作用
const chatListShow = computed( () => {
    return chatList.value.map(chat => {
        return { id: chat.user_id, name: chat.user_name, avatarUrl: chat.avatar_url, updatedAt: chat.updated_at}
    })
})

// 根据选中会话的id 计算出消息列表
const exeDir = import.meta.env.VITE_EXE_DIR  // 主程序运行目录
const voiceDir = exeDir + 'config/tts/'
const msgListShow = computed(() => {
    const chatMsg = chatMsgList.value.find(_chatMsg => _chatMsg.conversation_id === selectedChat.value.conversation_id)
    if (chatMsg) {
        // 组装成符合组件要求的格式
        return chatMsg.messages.map((item, index) => {
            return {
                messageId: item.message_id,
                senderId: item.sender_id,
                content: item.content,
                messageType: item.message_type,
                voicePath: (item.voice_path === '' || item.voice_path === 'error' || item.voice_path === 'run') ? item.voice_path : voiceDir + item.voice_path,
                createdAt: item.created_at,
                translatedText: item.translated_text,
                ...(
                    (item.sender_id === chatConsts.LORD_ID && item.isTemporary) // 临时消息, 显示发送状态
                    && { sendStatus: item.send_status }
                ),
                
            }
        })
    }else{
        return []
    }
})

// 向主进程请求加载会话列表
const updateChatList = async () => {
    const chatListJsonArray = await window.ipcRenderer.invoke(chatEvents.GET_CHAT_LIST)
    if (chatListJsonArray.length > 0) {
        console.log('In Chat.vue, 加载会话列表, chatListJsonArray', chatListJsonArray)
        loadChatList(chatListJsonArray)
        // console.log('In Chat.vue, chatList', chatList.value)
    }
    else{
        console.log('In Chat.vue, chatListJsonArray.length is 0')
    }
}
// 向主进程请求加载消息列表
const updateChatMsgList = async () => {
    if (chatList.value.length > 0) {
        const userIds = chatList.value.map(chat => chat.user_id)
        const chatMsgList = await window.ipcRenderer.invoke(chatEvents.GET_CHAT_MSG_LIST, {userIds: userIds, limit: 10, offset: 0})
        console.log('In Chat.vue, 加载消息列表, ', chatMsgList)
        loadChatMsgList(chatMsgList)
    }
    else{
        loadChatMsgList([])
    }
}
watch(chatList, () => {
    updateChatMsgList()  // 监听会话列表变化, 重新加载消息列表
}, { immediate: true })

// 清空上下文按钮点击事件
const showDeleteMsg = () => {
    deleteModalVisible.value = true
    console.log('In Chat.vue, 删除上下文')
}
// 清空上下文
const deleteMsg = async () => {
    // 后端数据删除
    window.ipcRenderer.send(chatEvents.DELETE_MSG, selectedChat.value.conversation_id)
    // 前端数据删除
    clearChatMsg(selectedChat.value.conversation_id)
}
// 清空上下文的状态信息弹窗
const deleteModalVisible = ref(false)   // 弹窗是否可见
const modalContent = ref('这将清空角色的所有聊天记录, 是否继续?')
const handleDeleteOk = () => {          // 弹窗确定按钮事件回调函数
    deleteModalVisible.value = false
    deleteMsg()
}

// 语音通话模态窗
const voiceModalVisible = ref(false)   // 弹窗是否可见
const alkiModalRef = ref(null)         // 弹窗组件实例
const selectedPostUrl = ref('')        // 选中联系人海报路径
let handleAlkiModalBeforeClose = null
const isAlki = ref(false)              // 是否使用Alki模式
const talkNow = () => {
    isAlki.value = true
    voiceModalVisible.value = true
    // 给聊天背景添加毛玻璃效果
    const defaultPostUrl = exeDir + 'config/post/defaultPost/defaultPost.png'
    selectedPostUrl.value = selectedChat.value?.post_url || defaultPostUrl
    nextTick(() => {
        let alkiModal = document.querySelector('.alki-modal')
        let mask = alkiModal.querySelector('.arco-modal-mask')
        let fullScreen = alkiModal.querySelector('.arco-modal.arco-modal-fullscreen')
        // 添加毛玻璃背景
        Object.assign(fullScreen.style, {
            background: 'none',
            backdropFilter: 'blur(100px)',
        })
        // 消除打开及关闭模态窗时的背景前景突兀显示
        requestAnimationFrame(() => {
            Object.assign(mask.style, {
                backgroundImage: `url(${selectedPostUrl.value})` || 'none',
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
                opacity: 1,
            })
        })
        handleAlkiModalBeforeClose = () => {
            isAlki.value = false  // 关闭Alki模式 关闭Ai回复的自动语音转换
            Object.assign(mask.style, {
                background: 'none',
            })
        }
    })
    
}
const isAudioPlaying = ref(false)   // 语音播放器是否正在播放
const isStopPlaying = ref(false)    // 控制语音播放器是否停止播放
// 语音播放控制
const audioPlayControl = () => {
    if (isAudioPlaying.value && !isStopPlaying.value) {
        isStopPlaying.value = true
        // 重置状态由停止后的监听实现
    }
}
const voiceAnimation = ref(exeDir + 'config/animation/aiVoice.json')
const isCloseMic = ref(true)       // 用户输入麦克风
const isRecordSaved = ref(false)   // 阻塞监听语音保存完毕
const isErrorOccured = ref(false)  // 麦克风监听器因频繁关闭而出错
// 阻塞等待recordSaved事件的函数
const waitForRecordSaved = () => {
  return new Promise((resolve, reject) => {
    // 超时处理
    const timeout = 5000 // 5秒超时
    const timer = setTimeout(() => {
        reject(new Error(`录音保存超时(${timeout}ms)`))
    }, timeout)

    // 事件监听器
    watchEffect(() => {
        if (isRecordSaved.value) {
            if (timer) {
                clearTimeout(timer)
            }
            resolve()
        }
        else if (isErrorOccured.value) {
            reject('中途报错')
        }
    })
  })
}
const isAlkiInput = ref(false)    // 是否使用Alki模式
const alkiInput = ref('')         // Alki模式输入内容
const isAsrFinished = ref(false)  // 在语音识别和播放MP3之间切换 
const isAsrAllowed = ref(true)    // 是否允许点击语音识别按钮
watch(isChatFinished, (newVal) => {
    if (newVal) {
        isAsrAllowed.value = true  // 允许点击语音识别按钮
    }else {
        isAsrAllowed.value = false  // 禁止点击语音识别按钮
    }
})   
const voiceInputControl = async () => {
    // 一轮对话结束才能触发语音输入
    if (isAsrAllowed.value) {
        isAsrFinished.value = false
        if (isCloseMic.value) {
            isCloseMic.value = false
        }
        else {
            isCloseMic.value = true
            // 关闭麦克风后 也关闭语音输入按钮
            isAsrAllowed.value = false
            // 反复切换isAlkiMode, 循环触发InputArea的发生消息函数
            isAlkiInput.value = false
            // 阻塞等待音频保存完毕
            console.log('In Chat.vue, 开始阻塞等待语音保存完毕')
            // 快速开关录音时,会导致waitForRecordSaved()出错, 导致后续状态重置代码不执行, 因此添加try catch
            let asrText = ''
            try {
                await waitForRecordSaved()
                // 成功获取到最新录音文件 请求语音识别
                asrText = await window.ipcRenderer.invoke(chatEvents.ASR)
                console.log('In Chat.vue, 语音识别结果:', asrText)
                const inValidText = new Set(['.', 'Yeah.', '。', 'The.', 'Okay.', 'I.'])
                if (inValidText.has(asrText) || asrText.length <= 2) {
                    asrText = ''
                    Message.warning('你好像什么都没说!')
                }
            } catch (error) {
                console.log('In Chat.vue, 语音出错:', error) 
                Message.warning('话太短')
                isErrorOccured.value = false
            }
            
            isRecordSaved.value = false  // 重置保存状态
            isAsrAllowed.value = true 
            alkiInput.value = asrText
            isAlkiInput.value = true
            isAsrFinished.value = true
        }
    }
}

// 路由配置
const route = useRoute()
// 根据RoleInfo发送的路由参数决定是否打开语音通话模态窗
const helpSendText = ref('')
watchEffect(async () => {
    if (route.name === 'chat') {
        helpSendText.value = ''  // 重置随机聊天文本 触发子组件监听器更新
        let voice = false
        if (route.params?.voice === 'true' || route.params?.voice === 'false') {
            voice = JSON.parse(route.params.voice)
        }
        // RoleInfo 要求打开语音通话模态窗
        if (voice === true) {
            talkNow()
        }  // 主页面发起随机聊天
        else if (voice === false && route.params?.randomChatText) {
            await new Promise((resolve) => setTimeout(resolve, 500))  // 阻塞等待会话列表查询更新完毕
            helpSendText.value = route.params.randomChatText
            console.log('In Chat.vue, 随机聊天模式, 打开随机聊天窗口', route.params.randomChatText)
        }
    }
})

// 监听事件加入与销毁
onMounted( async () => {
    window.ipcRenderer.on(chatEvents.PART_ANSWER, handleMessagePartAnswer)
    updateChatList()      // 挂载时更新聊天列表
})
onBeforeUnmount(() => {
    window.ipcRenderer.removeAllListeners(chatEvents.PART_ANSWER)
})

</script>

<style scoped>
.chat-wrapper {
    width: 100%;
    height: 100%;
    /*border: 2px solid rgb(35, 207, 113);*/
    background: none;
}
/* 改变slider默认背景色*/
.chat-wrapper :deep(.arco-layout-sider) {
    background: none;
    box-shadow: none;
    /*border-right: 1px solid rgba(0, 0, 0, 0.1);*/
}

/* 对话header+content+footer */
.chat-main {
    /*border: 2px solid rgb(15, 46, 29);*/
    background-color: var(--color-ivory-shoadow);
}
/* 未进入聊天时的背景页 */
.chat-back {
    position: relative;
    background-color: var(--color-ivory-shoadow)
}
.chat-header {
    background:var(--color-ivory-shoadow);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    height: 60px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0px 20px 20px;
    font-size: 20px;
}
.chat-content {
    position: relative;
    /*border: 2px solid rgb(35, 207, 113);*/
}
.chat-show {
    position: absolute;
    width: 100%;
    bottom: 0;
}

/* 语音通话按钮 */
.chat-header-btn-alki:hover {
    color: var(--olivine-450);
}

/* 删除上下文按钮 */
.chat-header-btn-delete:hover {
    color: var(--rust-450);
}
</style>

<style>
/* 语音通话模态窗样式 */
.alki-modal .arco-modal-fullscreen {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.alki-modal .arco-modal-header {
    position: absolute;
    top: 0px;
    height: 40px;
    border-bottom: none;
}
.alki-modal .arco-modal-body {
    position: unset;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.alki-modal .arco-modal-footer {
    display: none;
}
/* 通话控制按钮 */
/* 非录音状态 */
.alki-modal-btns .arco-btn {
    color: var(--success-450);
    background: none;
}
.alki-modal-btns .arco-btn:hover {
    color: var(--success-450);
    background: rgb(255, 255, 255, 0.2);
}
/* 录音键样式 */
.alki-modal-btn-recording.arco-btn {
    color: var(--rust-450);
}
.alki-modal-btn-recording.arco-btn:hover {
    color: var(--rust-450);
}
/* 对话进行中严禁ASR服务 */
.alki-modal-btn-record-not-allowed.arco-btn {
    color: gray;
    cursor: not-allowed;
}
.alki-modal-btn-record-not-allowed.arco-btn:hover {
    color: gray;
    cursor: not-allowed;
}
/* 右侧停止键样式 */
.alki-modal-btns .arco-btn.alki-modal-btn-stop-enable {
    color: var(--rust-450);
    cursor: pointer;
}
.alki-modal-btns .arco-btn.alki-modal-btn-stop-disable {
    color: gray;
    cursor: not-allowed;
}
.alki-modal-btns .arco-btn.alki-modal-btn-stop-thinking {
    color: var(--olivine-450);
}
/* 改变图标插槽的布局 */
.alki-modal-btns .arco-btn-icon {
    display: flex;
    align-items: center;
}
/*改变加载图标颜色*/
.alki-modal-btn-spin .arco-spin-icon .arco-dot-loading .arco-dot-loading-item:nth-child(3) {
    background-color: var(--olivine-225)
}
.alki-modal-btn-spin .arco-spin-icon .arco-dot-loading .arco-dot-loading-item:nth-child(4) {
    background-color: var(--olivine-100)
}
.alki-modal-btn-spin .arco-spin-icon .arco-dot-loading .arco-dot-loading-item:nth-child(5) {
    background-color: #cde3bb
}
</style>