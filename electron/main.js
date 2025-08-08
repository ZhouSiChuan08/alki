// 创建窗口、加载目标文件

// 监听： 当Electron 完成初始化时，创建一个新窗口

// 监听： 当所有窗口关闭时 退出应用

const {app, BrowserWindow, ipcMain, nativeImage, globalShortcut} = require('electron');  // 导入electron模块
const { spawn } = require('child_process');  // 导入child_process模块
const zmq = require('zeromq');               // 导入zeromq模块
const path = require('path');                // 获取main.js所在目录
const fs = require('fs');                    // 文件操作
const fsPromises = require('fs/promises');   // 文件操作 fs.writeFile属于异步操作 为保证文件彻底保存后再通知渲染进程 使用promises
import { chatEvents, subWindowEvents, roleEvents, saveEvents, modelEvents, windowEvents } from '../src/shared/consts.ts';
import { dealerIDs, ipcType } from '../src/shared/consts.ts';
import { toolFuns } from '../src/shared/toolFuns.ts';
import { taskStatus } from '../src/shared/consts.ts';


// 额外程序资源需指定开发环境和生产环境的路径
let exePath = '', ipcPathMain = '', ipcPathCMD = '';
// 设置图标
const appIcon = nativeImage.createFromPath('./electron/resource/images/alki_icon.ico');
const isDevelopment = process.env.NODE_ENV === 'development';  // 判断是否开发环境

// 自定义窗体控制
function windowControl(window) {
    // 向渲染进程发送窗口ID，用于事件前缀
    window.webContents.on('did-finish-load', () => {
        window.webContents.send(windowEvents.WINDOW_ID, window.id);
    });
    // 自定义实现窗口控制功能
    ipcMain.on(`${windowEvents.WINDOW_MINIMIZE+window.id}`, () => {
        window && window.minimize();
    });
    ipcMain.on(`${windowEvents.WINDOW_MAXIMIZE+window.id}`, () => {
        if (window.isMaximized()) {
            window && window.unmaximize();
        } else {
            window && window.maximize();
        }
    });
    ipcMain.on(`${windowEvents.WINDOW_CLOSE+window.id}`, () => {
        window && window.close();
    });
}

// 创建主窗口
let mainWindow;
function createMainWindow () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 1000,   // 最小宽度
        minHeight: 800,  // 最小高度
        autoHideMenuBar: true,  // 隐藏默认菜单栏
        frame: false,  // 禁用原生窗口边框
        // titleBarStyle: 'hidden',
        // resizable: false, // 添加这一行来固定窗口尺寸
        webPreferences: {
            nodeIntegration: true,  // mainWindow中可以使用Node.js API
            preload: path.join(__dirname, 'preload.js'),  //${__dirname} 代表当前文件所在目录  多系统拼接字符串方法
            //preload: `${__dirname}/preload.js`
            devTools: isDevelopment  // 仅在开发环境下打开开发者工具
        },
        icon: appIcon  // 设置图标
    });
    //mainWindow.webContents.openDevTools() //强制打开开发者工具
    //mainWindow.loadURL("http://localhost:5173")
    //VITE_DEV_SERVER_URL 是开发服务器的 url, 只在开发环境中存在
    if(process.env['VITE_DEV_SERVER_URL']){
        mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'])
        exePath = path.join(__dirname, 'cpp', 'alkiserver.exe');  // 开发环境下指定 exe 路径
        ipcPathMain = path.join(__dirname, 'cpp','alkiserver');   // 开发环境下指定 ipc 路径
        ipcPathCMD = path.join(__dirname, 'cpp','alkiserver_cmd');
    }else{
        //mainWindow.loadFile('dist/index.html')
        mainWindow.loadFile(path.resolve(__dirname,"../dist/index.html"))  // 打包才有用 因为开始时没有dist文件夹
        exePath =  path.join(app.getAppPath(), '..', '..', 'resources', 'cpp', 'alkiserver.exe');
        ipcPathMain =  path.join(app.getAppPath(), '..', '..', 'resources', 'cpp','alkiserver');
        ipcPathCMD =  path.join(app.getAppPath(), '..', '..', 'resources', 'cpp','alkiserver_cmd');
    }
    windowControl(mainWindow);  // 自定义窗体控制
}
// 创建子窗口
let isSubWindowOpen = false;
function createSubWindow (options) {
    const defaultOptions = {
        width: 400,
        height: 800,
        parent: BrowserWindow.getFocusedWindow(),
        modal: true,
        minimizable: false,
        maximizable: false,
        resizable: false,
        autoHideMenuBar: true,
        frame: false,  // 禁用原生窗口边框
        show: false,  // 先隐藏窗口，on('ready-to-show')事件后再显示
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        icon: appIcon
    }
    options = {...defaultOptions, ...options};
    let subWindow = new BrowserWindow(options);
    if(process.env['VITE_DEV_SERVER_URL']){
        subWindow.loadURL(process.env['VITE_DEV_SERVER_URL'] + '#' + options.routerPath)  // 开发环境下指定路径
    }else{
        subWindow.loadFile(path.resolve(__dirname,"../dist/index.html"), {
            hash: '#' + options.routerPath,
        }) // 打包才有用 因为开始时没有dist文件夹
    }
    subWindow.once('ready-to-show', () => {
        subWindow.show();  // 显示窗口
    });  // 窗口准备好后再显示
    subWindow.on('closed', () => {
        subWindow = null;         // 销毁引用
        isSubWindowOpen = false;  // 子窗口关闭后置为 false
    });
    windowControl(subWindow);  // 自定义窗体控制
}

// 创建 DEALER 套接字
async function makeDealerSocket(dealerID, type) {
    const socket = new zmq.Dealer();     // 创建 DEALER 套接字
    socket.routingId = dealerID;          // 设置路由标识符
    if (type === ipcType.MAIN) {
        socket.connect('ipc://' + ipcPathMain);  // 连接到服务器的 ipc 通道
    }
    else if (type === ipcType.CMD) {
        socket.connect('ipc://' + ipcPathCMD);  // 连接到服务器的 ipc 通道
    }
    // socket.connect('tcp://localhost:5555');  // 连接到服务器的 ipc 通道
    return socket;  // 返回套接字
}

// 监听事件，应用程序准备就绪
app.on('ready', () => {
    createMainWindow();  // 创建窗口
    // 启动C++后端应用
    const cppProcess = spawn(exePath, [
        '1'  // 启动参数
    ], { cwd: path.dirname(exePath) });  // cwd是子进程的工作目录 current working directory
    // // 监听子进程的 exit 事件 判断是否退出
    cppProcess.on('exit', (code) => {
        console.log(`C++ 后端进程退出，退出码 ${code}`);
    });
    cppProcess.stdout.on('data', (data) => {
        const message = data.toString().trim();  // trim()去除字符串两端的空白字符
        console.log(`C++ 后端进程标准输出:\n${message}`);
    });
    cppProcess.stderr.on('data', (data) => {
        console.error(`C++ 后端进程错误输出:\n${data.toString()}`);
    });
    // 生产环境下禁用ctrl + R 刷新
    if (!isDevelopment) {
        globalShortcut.register('CommandOrControl+R', () => {
            console.log('主进程禁用刷新');
        });
    }
});  //应用准备就绪 就创建窗口

// 监听事件，所有窗口都关闭
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();  // Mac系统保留应用后台
    // 取消全局注册的快捷键
    globalShortcut.unregisterAll();
});

// 业务代码
// 监听用户消息 发起提问 返回答案 {"roleInfo":{"area":"中国","userId":2,"userName":"胡英俊","gender":"male","presupposition":"123"},"userQuestion":"你好"}
ipcMain.handle(chatEvents.QUESTION, async (event,  userIdAndQuestion) => {
    const userIdAndQuestionStr = JSON.stringify(userIdAndQuestion);
    const dealerID = dealerIDs.UserChat;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    console.log('主进程接收到用户消息:', userIdAndQuestionStr);
    try {
        await dealer.send([userIdAndQuestionStr, 'END']);
        console.log(`${dealerID} 消息发送成功`);
    } catch (error) {
        console.error(`${dealerID} 消息发送失败:`, error);
    }
    const timeout = 20 * 1000;  // 超时时间 毫秒
    // 接收消息 
    let isSendSuccess = true;  // 是否发送成功到后端
    while (true) {
        let reply;
        let timer;
        try {
            // 使用Promise.race来进行超时控制和router的通信 有回复立即返回，超时则抛出超时错误
            reply = await Promise.race([
                dealer.receive(),
                new Promise((resolve, reject) => {
                    timer = setTimeout(() => {
                        reject(new Error('Reply Timeout'));
                    }, timeout);
                })
            ]);
        } catch (error) {
            if (error.message === 'Reply Timeout') {
                clearTimeout(timer);     // 清除定时器
                dealer.close();
                console.error(`${dealerID} 超时关闭`);
                event.sender.send(chatEvents.IS_SEND_SUCCESS, false);
                return 'Reply Timeout';  // 返回超时结果 停止循环
            }
            throw error;                 // 抛出非超时错误
        }
        clearTimeout(timer);             // 清除定时器
        if (reply.at(-1).toString() === 'END') {
            event.sender.send(chatEvents.PART_ANSWER, 'END');
            break;
        }
        if (reply[0].toString() === taskStatus.FAILURE + dealerID) {
            console.error(`${dealerID} 本次请求失败:`);
            dealer.close();
            event.sender.send(chatEvents.IS_SEND_SUCCESS, false);
            return false;                // 本次请求失败 停止循环
        }
        if (isSendSuccess) {
            event.sender.send(chatEvents.IS_SEND_SUCCESS, true);
            isSendSuccess = false;      // 发送成功后置为 false 只运行一次
        }
        reply.forEach((frame, index) => {
            const partAnswer = frame.toString();
            event.sender.send(chatEvents.PART_ANSWER, partAnswer);
        });
    }
    // 关闭套接字 释放资源
    dealer.close();
    console.log(`${dealerID} 完成router接收`);
    return true;                                          // 返回结果
});

// 监听保存事件
let prefix='config';
// 检查config目录是否存在，如果不存在则创建
if (!fs.existsSync(prefix)) {
    fs.mkdirSync(prefix, { recursive: true }); // recursive: true 表示递归创建目录
}
// 保存图片
ipcMain.handle(saveEvents.IMAGE, async (event, {folderName, fileName, arrayBuffer}) => {
    const savePath = path.join(prefix, folderName, fileName);
    const dir = path.dirname(savePath);
    try {
        // 检查目录是否存在，不存在则创建 recursive: true 表示递归创建目录
        await fsPromises.mkdir(dir, { recursive: true });
        // 写入文件
        await fsPromises.writeFile(savePath, Buffer.from(arrayBuffer));
        console.log('图像文件已保存:', savePath);
        return true;
    } catch (err) {
        console.error('图像文件保存失败:', err);
        return false;
    }
});
// 保存wav文件
ipcMain.handle(saveEvents.WAV, async (event, {folderName, fileName, arrayBuffer}) => {
    const savePath = path.join(prefix, folderName, fileName);
    const dir = path.dirname(savePath);
    try {
        // 检查目录是否存在，不存在则创建 recursive: true 表示递归创建目录
        await fsPromises.mkdir(dir, { recursive: true });
        // 写入文件
        await fsPromises.writeFile(savePath, Buffer.from(arrayBuffer));
        console.log('录音文件已保存:', savePath);
        return true;
    } catch (err) {
        console.error('录音文件保存失败:', err);
        return false;
    }
});


// 创建子窗口
ipcMain.on(subWindowEvents.MAKE_ROLE, (event, {options}) => {
    if (!isSubWindowOpen) {
        createSubWindow(options);
        isSubWindowOpen = true;
        console.log('创建子窗口成功', options.routerPath);
    }
});

// 接收角色配置信息, 新建角色到数据库 格式为json字符串
ipcMain.handle(roleEvents.ADD_ROLE_PROFILE, async (event, jsonRoleProfile) => {
    // console.log('解析为对象:', JSON.parse(jsonRoleProfile));
    // 合并RoleProfile中的gender和genderOther字段
    let roleProfile = JSON.parse(jsonRoleProfile);
    const gender = roleProfile.gender || roleProfile.genderOther;
    delete roleProfile.genderOther;  // 删除genderOther字段
    roleProfile.gender = gender;     // 合并gender字段
    // console.log('合并后角色配置信息:', roleProfile);
    // 将所有属性的值都trim一下
    const trimmedRoleProfile = toolFuns.trimObjectProperties(roleProfile);
    console.log('所有属性值都trim后角色配置信息:', trimmedRoleProfile);
    // 再Json字符串化
    const jsonTrimmedRoleProfile = JSON.stringify(trimmedRoleProfile);

    // 将角色配置信息发送到C++后端 保存到数据库
    const dealerID = dealerIDs.AddRoleProfile;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);                                               // 创建套接字 不加await会报错
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, jsonTrimmedRoleProfile);  // 发送消息
    if (isSendSuccess) {
        const isTaskSuccess = await toolFuns.onlyStatusReturnTask(dealer, dealerID, 20);                 // 等待结果
        // 关闭套接字 释放资源
        dealer.close();
        if(isTaskSuccess)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        // 关闭套接字 释放资源
        dealer.close();
        return false;
    }
});

// 接收角色配置信息, 更新角色到数据库 格式为json字符串
ipcMain.handle(roleEvents.RE_EDIT_ROLE_PROFILE, async (event, jsonRoleProfile) => {
    // console.log('解析为对象:', JSON.parse(jsonRoleProfile));
    // 合并RoleProfile中的gender和genderOther字段
    let roleProfile = JSON.parse(jsonRoleProfile);
    const gender = roleProfile.gender || roleProfile.genderOther;
    delete roleProfile.genderOther;  // 删除genderOther字段
    roleProfile.gender = gender;     // 合并gender字段
    // console.log('合并后角色配置信息:', roleProfile);
    // 将所有属性的值都trim一下
    const trimmedRoleProfile = toolFuns.trimObjectProperties(roleProfile);
    console.log('所有属性值都trim后角色配置信息:', trimmedRoleProfile);
    // 再Json字符串化
    const jsonTrimmedRoleProfile = JSON.stringify(trimmedRoleProfile);

    // 将角色配置信息发送到C++后端 保存到数据库
    const dealerID = dealerIDs.ReEditRoleProfile;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);                                       // 创建套接字 不加await会报错
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, jsonTrimmedRoleProfile);        // 发送消息
    if (isSendSuccess) {
        const isTaskSuccess = await toolFuns.onlyStatusReturnTask(dealer, dealerID, 20);                 // 等待结果
        // 关闭套接字 释放资源
        dealer.close();
        if(isTaskSuccess)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        // 关闭套接字 释放资源
        dealer.close();
        return false;
    }
});

// 前端查询联系人列表 返回联系人json字符串数组
ipcMain.handle(roleEvents.GET_ROLE_PROFILES, async (event) => {
    const dealerID = dealerIDs.GetRoleProfiles;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, '');  // 发送消息
    if (isSendSuccess) {
        const {status, data} = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);  // 等待处理结果
        // 关闭套接字 释放资源
        dealer.close();
        if (status) {
            const dataStr = data[0].toString();
            const roleProfiles = JSON.parse(dataStr);  // 转为对象{ roleProfiles: [{...}, {...},...] }
            console.log('In main.js, 成功获取角色配置信息');
            return roleProfiles.roleProfiles;          // 返回对象数组
        }
        else {
            console.log('获取角色配置信息失败');
            return [];
        }
    }
    else
    {
        // 关闭套接字 释放资源
        dealer.close();
        return [];
    }
});

// 前端请求创建会话表或插入新会话 (event, 会话对象user_id)
ipcMain.handle(chatEvents.MAKE_CHAT, async(event, chatInfo) => {
    console.log('前端请求创建会话表或插入新会话, 会话对象ID:', chatInfo.userId, '会话对象名称:', chatInfo.userName, '会话类型:', chatInfo.type);
    const chatInfoJsonStr = JSON.stringify(chatInfo);
    const dealerID = dealerIDs.MakeChat;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, chatInfoJsonStr);  // 发送消息
    if (isSendSuccess) {
        const isTaskSuccess = await toolFuns.onlyStatusReturnTask(dealer, dealerID, 20);  // 等待结果
        dealer.close();  // 关闭套接字 释放资源
        if (isTaskSuccess) {
            console.log('创建会话表或插入新会话成功');
            return true;
        }
    }
    dealer.close();
    return false;
})

// 子窗口通知更新联系人列表
ipcMain.on(roleEvents.UPDATE_CONTACTLIST, () => {
    mainWindow.webContents.send(roleEvents.UPDATE_CONTACTLIST);  // 发送事件通知主窗口更新联系人列表
})

// 前端请求加载会话列表
ipcMain.handle(chatEvents.GET_CHAT_LIST, async (event) => {
    console.log('前端请求加载会话列表');
    const dealerID = dealerIDs.GetChatList;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);                           // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, '');  // 发送消息
    if (isSendSuccess) {
        // 等待返回结果 会话列表
        const {status, data} = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);
        dealer.close();                            // 关闭套接字 释放资源
        if (status) {
            const dataStr = data[0].toString();    // json字符串 值为数组
            const chatList = JSON.parse(dataStr);  // 转为对象{ chatList: [{...}, {...},...] }
            console.log('成功获取会话列表');
            return chatList.chatList;              // 返回对象数组
        }
        else {
            return [];
        }
    }
    else {
        dealer.close();
        return [];
    }
})

// 前端请求创建单条消息记录
ipcMain.handle(chatEvents.MAKE_MSG, async (event, {msgObj, dealerID}) => {
    const msgJsonStr = JSON.stringify(msgObj);
    console.log('Json字符串化后消息对象:', msgJsonStr);
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);                                   // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, msgJsonStr);  // 发送消息
    if (isSendSuccess) {
        // 等待返回结果 成功或失败 不需要通知前端, 所以不使用返回值
        let isTaskSuccess = false;
        let data = [];
        if (dealerID === dealerIDs.MakeMsgAi) {
            ({isTaskSuccess, data}  = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20));
             dealer.close();
            const dataStr = data[0].toString();
            const remainMsgAttri = JSON.parse(dataStr);
            return remainMsgAttri;
        }
        else {
            isTaskSuccess = await toolFuns.onlyStatusReturnTask(dealer, dealerID, 20);  // 等待结果
        }
        dealer.close();
        isTaskSuccess && console.log(`创建 ${dealerID} 单条消息记录成功`);
        !isTaskSuccess && console.log(`创建 ${dealerID} 单条消息记录失败`);
        return {};
    }
    else {
        dealer.close();
        return {};
    }
})

// 前端请求获取会话消息记录 返回消息记录json字符串数组
ipcMain.handle(chatEvents.GET_CHAT_MSG_LIST, async (event, chatMsgInfo) => {
    console.log('前端请求获取会话消息记录, userIds:', chatMsgInfo.userIds, '获取条数:', chatMsgInfo.limit, '偏移量:', chatMsgInfo.offset);
    const dealerID = dealerIDs.GetChatMsgList;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);                                           // 创建套接字
    const chatMsgInfoJsonStr = JSON.stringify(chatMsgInfo);
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, chatMsgInfoJsonStr);  // 发送消息
    if (isSendSuccess) {
        // 等待结果, 所有user_id对应单聊会话ID的消息记录
        const {status, data} = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);
        dealer.close();                               // 关闭套接字 释放资源
        if (status) {
            const dataStr = data[0].toString();       // json字符串 值为数组
            const chatMsgList = JSON.parse(dataStr);  // 转为对象{ chatMsgList: [{...}, {...},...] }
            return chatMsgList.chatMsgList;           // 返回对象数组
        }
        else {
            return [];
        }
    }
    else {
        dealer.close();  // 关闭套接字 释放资源
        return [];
    }
})

// 云服务api
let CloundServiceApi = null;
// 初始化云服务api
async function initCloudServiceApi() {
    const dealerID = dealerIDs.GetLocalModelsSetting;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, '');  // 发送消息
    if (isSendSuccess) {
        // 等待结果, 本地模型列表
        const {status, data} = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);
        dealer.close();  // 关闭套接字 释放资源
        if (status) {
            const dataStr = data[0].toString();       // json字符串 值为数组
            const localModelsAndSettings = JSON.parse(dataStr);  // 转为对象{ ModelSelected: '' ,models: [{...}, {...},...], Settings }
            CloundServiceApi = localModelsAndSettings.CloudServiceApi;
            console.log('云服务api初始化成功');
        }
        else {
        }
    }
    else {
        dealer.close();  // 关闭套接字 释放资源
    }
}
ipcMain.on(modelEvents.INIT_CLOUD_API, (event) => {
    initCloudServiceApi();
})

// 前端获取本地模型列表及配置项
ipcMain.handle(modelEvents.GET_LOCAL_MODELS_Setting, async (event) => {
    const dealerID = dealerIDs.GetLocalModelsSetting;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, '');  // 发送消息
    if (isSendSuccess) {
        // 等待结果, 本地模型列表
        const {status, data} = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);
        dealer.close();  // 关闭套接字 释放资源
        if (status) {
            const dataStr = data[0].toString();       // json字符串 值为数组
            const localModelsAndSettings = JSON.parse(dataStr);  // 转为对象{ ModelSelected: '' ,models: [{...}, {...},...], Settings }
            return localModelsAndSettings;
        }
        else {
            return {};
        }
    }
    else {
        dealer.close();  // 关闭套接字 释放资源
        return {};
    }
})

// 前端修改配置文件
ipcMain.handle(modelEvents.WRITE_SETTING, async (event, configJsonStr) => {
    let isSuccess = true;
    console.log('前端修改配置文件:', configJsonStr);
    const dealerID = dealerIDs.WriteSetting;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, configJsonStr);  // 发送消息
    if (isSendSuccess) {
        const isTaskSuccess = await toolFuns.onlyStatusReturnTask(dealer, dealerID, 20);  // 等待结果
        dealer.close();  // 关闭套接字 释放资源
        if (isTaskSuccess) {
            console.log('配置文件修改成功');
            isSuccess = true;
        }
        else {
            console.log('配置文件修改失败');
            isSuccess = false;
        }
    }
    else {
        dealer.close();  // 关闭套接字 释放资源
    }
    return isSuccess;
})

// 前端请求删除一个会话的上下文 (event, 会话ID)
ipcMain.on(chatEvents.DELETE_MSG, async (event, conversationId) => {
    console.log('前端请求删除一个会话的上下文, 会话ID:', conversationId);
    const dealerID = dealerIDs.DeleteMsg;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    await toolFuns.sendDealerMsg(dealer, dealerID, `${conversationId}`);  // 发送消息
    dealer.close();  // 关闭套接字 释放资源
})

// 前端请求删除一个联系人 (event, 联系人ID)
ipcMain.on(roleEvents.DELETE_CONTACT, async (event, userId) => {
    console.log('前端请求删除一个联系人, 联系人ID:', userId);
    const dealerID = dealerIDs.DeleteContact;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    await toolFuns.sendDealerMsg(dealer, dealerID, `${userId}`);  // 发送消息
    dealer.close();  // 关闭套接字 释放资源
})

// 对话过程中, 前端请求停止对话
ipcMain.on(chatEvents.STOP_CHAT, async (event) => {
    console.log('前端请求停止对话');
    const dealerID = dealerIDs.CMD_STOP_CHAT;
    const dealer = await makeDealerSocket(dealerID, ipcType.CMD);     // 创建套接字
    await toolFuns.sendDealerMsg(dealer, dealerID, '');  // 发送消息
    dealer.close();  // 关闭套接字 释放资源
})

// 前端请求TTS
ipcMain.handle(chatEvents.TTS, async (event, ttsObj) => {
    console.log('前端请求TTS, user_id:', ttsObj.userId, 'msg_id:', ttsObj.messageId, 'text:', ttsObj.text);
    const dealerID = dealerIDs.TTS;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const ttsObjJsonStr = JSON.stringify(ttsObj);
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, ttsObjJsonStr);  // 发送消息
    if (isSendSuccess) {
        const {status, data} = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);  // 等待结果
        dealer.close();  // 关闭套接字 释放资源
        if (status) {
            console.log('TTS成功', data[0].toString());
            return data[0].toString();  //  必须使用toString()转zmq消息为字符串, 否则打印<Buffer 58 58 58...>
        }
        else {
            return '';
        }
    }
    else {
        dealer.close();
        return '';
    }
})

// 前端请求translate 任务
import { Signer } from '@volcengine/openapi';
const axios = require('axios');

async function translateText(accessKeyId, secretKey, sourceText) {
    // 配置请求基本信息
    const requestData = {
        region: 'cn-north-1',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            Action: 'TranslateText',
            Version: '2020-06-01'
        },
        body: JSON.stringify({
            TargetLanguage: 'zh',
            TextList: [sourceText]
        })
    };

    // 初始化签名器，指定服务为翻译服务
    const signer = new Signer(requestData, 'translate');
    
    // 添加认证信息生成签名 自动放入header
    signer.addAuthorization({
        accessKeyId: accessKeyId,
        secretKey: secretKey,
        sessionToken: ''
    });

    try {
        // 构建完整请求URL
        const baseUrl = 'https://translate.volcengineapi.com';
        const params = new URLSearchParams(requestData.params);
        const url = `${baseUrl}?${params.toString()}`;

        // 发送请求
        const response = await axios({
            url: url,
            method: requestData.method,
            headers: requestData.headers,
            data: requestData.body
        });
        return response.data;
    } catch (error) {
        console.error('翻译请求失败:', error.response?.data || error.message);
        throw error;
    }
}

// 前端请求翻译
ipcMain.handle(chatEvents.TRANSLATE, async (event, sourceText) => {
    if (!sourceText || sourceText.trim().length > 1000) {
        // 翻译文本长度限制为1000字符
        return '';
    }
    let targetText = '';
    // 设置aksk
    const AccessKeyId = CloundServiceApi.translate.AccessKeyId;
    const SecretKey = CloundServiceApi.translate.SecretKey;
    // 调用翻译函数
    const translatedData = await translateText(AccessKeyId, SecretKey, sourceText);
    targetText = translatedData.TranslationList[0]['Translation'];
    return targetText;
})

// 前端请求ASR服务
ipcMain.handle(chatEvents.ASR, async (event) => {
    const dealerID = dealerIDs.ASR;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, '');  // 发送消息
    if (isSendSuccess) {
        const {status, data} = await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);  // 等待结果
        dealer.close();  // 关闭套接字 释放资源
        if (status) {
            const dataStr = data[0].toString();       // json字符串 值为数组
            const asrResult = JSON.parse(dataStr);  // 转为对象{ asrResult: '' }
            return asrResult.text;
        }
        else {
            return '';
        }
    }
    else {
        dealer.close();
        return '';
    }
})

// 前端请求进行音色服务
ipcMain.handle(roleEvents.MANAGE_VOICE, async (event, {spkId, spkLines, audioFilePath, action}) => {
    console.log('前端请求进行音色服务, spkId:', spkId, 'spkLines:', spkLines ,'audioFilePath:', audioFilePath, 'action:', action);
    const dealerID = dealerIDs.TtsVoiceManage;
    const dealer = await makeDealerSocket(dealerID, ipcType.MAIN);  // 创建套接字
    const voiceServiceObj = {
        'spkId': spkId,
        'spkLines': spkLines,
        'audioFilePath': audioFilePath,
        'action': action
    }
    const voiceSeriviceJsonStr = JSON.stringify(voiceServiceObj);
    const isSendSuccess = await toolFuns.sendDealerMsg(dealer, dealerID, voiceSeriviceJsonStr);  // 发送消息
    if (isSendSuccess) {
        if (action === 'list') {
            const {status, data}= await toolFuns.nonStreamDataReturnTask(dealer, dealerID, 20);  // 等待结果
            dealer.close();
            if (status) {
                const dataStr = data[0].toString();       // json字符串 [{'spkId1': 'voiceId1'}, {'spkId2': 'voiceId2'}, ...]
                const voiceList = JSON.parse(dataStr);    // 转为对象
                return voiceList;
            }
            else {
                return [];
            }   
        }
        else if (action === 'delete') {
            const status = await toolFuns.onlyStatusReturnTask(dealer, dealerID, 20);  // 等待结果
            dealer.close();
            return status;   
        }
        else if (action === 'clone') {
            const status = await toolFuns.onlyStatusReturnTask(dealer, dealerID, 20);  // 等待结果
            dealer.close();
            return status;
        }
    }
    else {
        dealer.close();
        return false;
    }
})