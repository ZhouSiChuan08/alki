// dealerIDs
export const dealerIDs = {
    CMD_STOP_CHAT: "dealer:CMD_STOP_CHAT",
    UserChat: "dealer:UserChat",
    AddRoleProfile: "dealer:AddRoleProfile",
    ReEditRoleProfile: "dealer:ReEditRoleProfile",
    GetRoleProfiles: "dealer:GetRoleProfiles",
    MakeChat: "dealer:MakeChat",
    GetChatList: "dealer:GetChatList",
    MakeMsgLord: "dealer:MakeMsgLord",
    MakeMsgAi: "dealer:MakeMsgAi",  // 如果机主和ai消息都用同一个dealerID, 则会导致资源竞争, 无法保存
    GetChatMsgList: "dealer:GetChatMsgList",
    GetLocalModelsSetting: "dealer:GetLocalModelsSetting",
    WriteSetting: "dealer:WriteSetting",
    DeleteMsg: "dealer:DeleteMsg",
    DeleteContact: "dealer:DeleteContact",
    TTS: "dealer:TTS",
    TtsVoiceManage: "dealer:TtsVoiceManage",
    ASR: "dealer:ASR",
} as const;

export enum ipcType {
    MAIN,
    CMD,
};

// fileNames
// 制定文件操作相关的字符串常量
export const fileNames = {
    AVATAR: 'avatar',
    POST: 'post',
    FLAG: 'flag',
} as const;

// ipcEvents 制定IPC通信的事件名称
export const windowEvents = {
    WINDOW_ID: 'window:id',
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_CLOSE: 'window:close'
} as const;

export const chatEvents = {
    QUESTION: 'chat:question',
    PART_ANSWER: 'chat:part-answer',
    IS_SEND_SUCCESS: 'chat:is-send-success',
    MAKE_CHAT: 'chat:make-chat',
    GET_CHAT_LIST: 'caht:get-chat-list',
    MAKE_MSG: 'chat:make-msg',
    GET_CHAT_MSG_LIST: 'chat:get-chat-msg-list',
    DELETE_MSG: 'chat:delete-msg',
    STOP_CHAT: 'chat:stop-chat',
    TTS: 'chat:tts',
    ASR: 'chat:asr',
    TRANSLATE: 'chat:translate',
} as const;
export const subWindowEvents = {
    MAKE_ROLE:'subWindow:make-role',
    ROUTE_READY:'subWindow:route-ready',
} as const;
export const roleEvents = {
    ADD_ROLE_PROFILE: 'role:add-role-profile',
    RE_EDIT_ROLE_PROFILE: 'role:re-edit-role-profile',
    GET_ROLE_PROFILES: 'role:get-role-profiles',
    UPDATE_CONTACTLIST: 'role:update-contactlist',
    DELETE_CONTACT: 'role:delete-contact',
    MANAGE_VOICE: 'chat:manage-voice',
} as const;
export const saveEvents = {
    IMAGE:'save:image',
    WAV:'save:wav',
} as const;
export const modelEvents = {
    GET_LOCAL_MODELS_Setting: 'model:get-local-models-setting',
    WRITE_SETTING:'model:write-setting',
    INIT_CLOUD_API:'model:init-cloud-api',
} as const;

// 任务状态常量
export const taskStatus = {
    FAILURE: 'failure',
    SUCCESS: 'success',
} as const;

// 尺寸大小常量
export const sizes= {
    MODAL_WIDTH: 300,
    MODAL_HEIGHT: 200,
    MODAL_BORDERRADIUS: 10,
    MODAL_ICON_SIZE: 20,
    MODAL_CONTENT_HEIGHT: 40,
    SUB_WINDOW_WIDTH: 700,
    SUB_WINDOW_HEIGHT: 650,
} as const;

// 会话相关常量
export const chatConsts = {
    SINGLE: 'single',
    GROUP: 'group',
    LORD_ID: 1,  // 指定机主ID
    MAX_MEMORY_LENGTH: 40,  // 最大记忆长度
    MAX_ASR_THREADS: 5,  // 最大语音识别线程数
} as const;
