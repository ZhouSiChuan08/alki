import { defineStore } from "pinia"
import { ref } from "vue"

// 联系人信息的store
export const useChatStore = defineStore('chat', () => {
    // state属性
    const contactList = ref([])            // 联系人列表 元素具备所有字段
    const selectedContact = ref(null)      // 选中的联系人 元素具备所有字段 
    const chatList = ref([])               // 会话列表, 元素仅包含conversation_id, user_id, user_name, avatar_url, updated_at
    const selectedChat = ref(null)         // 选中的聊天对象 元素包含selectedContact所有字段 + conversation_id
    const chatMsgList = ref([])            // 所有会话的聊天消息列表  元素是
                                           // {conversation_id: number, messages: Array<{sender_id: number, content: string, message_type: string, message_id: number, voice_path: string, created_at: string}>}
    const isChatFinished = ref(true)       // 一轮会话是否结束

    // actions方法
    // 加载联系人列表
    function loadContactList(list) {
        contactList.value = list
    }
    // 选择联系人
    function selectContact(contact) {
        selectedContact.value = contact
    }
    // 加载聊天对话列表
    function loadChatList(list) {
        // 为chatList新增字段user_name, avatar_url
        chatList.value = list.map(chat => {
            const contact = contactList.value.find(item => item.user_id === chat.user_id)
            return contact ? {...chat, user_name: contact.user_name, avatar_url: contact.avatar_url}
            : chat
        })
    }
    // 选择聊天对话 contact: 联系人对象,根据联系人ID找到chatList中conversation_id
    function selectChat(contact) {
        const _chat = chatList.value.find(item => item.user_id === contact.user_id)
        selectedChat.value = {...contact, conversation_id: _chat?.conversation_id }
    }
    // 加载聊天消息列表
    function loadChatMsgList(list) {
        chatMsgList.value = list
    }
    // 添加一个会话的聊天消息
    function addChatMsg(msg) {
        chatMsgList.value.push(msg)
    }
    // 清空一个会话的聊天消息 只清空messages字段 保留会话
    function clearChatMsg(conversation_id) {
        const index = chatMsgList.value.findIndex(item => item.conversation_id === conversation_id)
        const targetChat = chatMsgList.value.find(item => item.conversation_id === conversation_id);
        if (targetChat?.messages) {
            targetChat.messages.length = 0;
        }
    }
    return {
        contactList, selectedContact, chatList, selectedChat,
        chatMsgList, isChatFinished,
        loadContactList, selectContact, loadChatList, selectChat,
        loadChatMsgList, addChatMsg, clearChatMsg
    }
})