const { contextBridge, ipcRenderer } = require('electron');  //ipcRenderer 实现渲染进程与主进程之间的异步通信
// import { contextBridge, ipcRenderer } from 'electron';  //ipcRenderer 实现渲染进程与主进程之间的异步通信

contextBridge.exposeInMainWorld('ipcRenderer', {      // 暴露接口名与其实现 接口名就是对象名 实现就是对象的方法或子成员 
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    invoke: (channel, data) => {                      // invoke方法用于主进程向渲染进程发送同步消息 可以拿到返回结果
        return ipcRenderer.invoke(channel, data);
    },
	on: (channel, listenerAction) => {                // on方法用于渲染进程监听主进程发送的消息
        ipcRenderer.on(channel, listenerAction);
    },
    once: (channel, listenerAction) => {              // once方法用于渲染进程监听主进程发送的消息 只能监听一次
        ipcRenderer.once(channel, listenerAction);
    },
    removeListener: (channel, listenerAction) => {    // 添加removeListener方法 移除指定通道的特定监听器 
        ipcRenderer.removeListener(channel, listenerAction); 
    },  // 用法：window.ipcRenderer.removeListener('channelName', callbackFunction)
    removeAllListeners: (channel) => {                // 可选：添加removeAllListeners方法 移除指定通道的所有监听器
        ipcRenderer.removeAllListeners(channel)
    },  // 用法：window.ipcRenderer.removeAllListeners('channelName')
    // 还有sendWithReply方法 用于主/渲染进程间的异步通信 一方使用sendWithReply发送/接收 另一方使用handle方法监听/回复
});