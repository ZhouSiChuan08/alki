<template>
    <div class="app">
        <!-- 重绘最小化、最大化、关闭按钮区域 -->
        <a-layout :style="{ height: '100%' }">
            <a-layout-header class="title-bar"  :style="{
                height: '30px',
                display: 'flex',
                justifyContent: 'flex-end',
            }">
                <div class="window-controls">
                    <button id="minimize-btn" v-if="!isSubWindow" class="control-btn" @click="minimizeWindow">
                        <svg class="window-control-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19519" width="200" height="200"><path d="M936.96 552.96H87.04c-19.968 0-35.84-15.872-35.84-35.84v-10.24c0-19.968 15.872-35.84 35.84-35.84h849.92c19.968 0 35.84 15.872 35.84 35.84v10.24c0 19.968-15.872 35.84-35.84 35.84z" p-id="19520"></path></svg>   
                    </button>
                    <button id="maximize-btn" v-if="!isSubWindow" class="control-btn" @click="maximizeWindow">
                        <svg class="window-control-icon" v-if="!isMaximized" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12479" width="200" height="200"><path d="M936.8 87.2V936H87.2V87.2h849.6m4.8-79.2H81.6C40.8 8 8 40.8 8 81.6v860c0 40.8 32.8 73.6 73.6 73.6h860c40.8 0 73.6-32.8 73.6-73.6V82.4c0.8-41.6-32-74.4-73.6-74.4 0.8 0 0 0 0 0z" p-id="12480"></path></svg>
                        <svg class="window-control-icon" v-else viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14776" width="200" height="200"><path d="M741.9 281.7v663h-663v-663h663m0.8-76.1H78.1c-41.3 0-76.1 34-76.1 76.1v664.6c0 41.3 34 76.1 76.1 76.1h664.6c41.3 0 76.1-34 76.1-76.1V280.9c-0.8-42.1-34-75.3-76.1-75.3z m204.8-204H281.3c-41.3 0-74.5 34-75.3 74.5v77.7h76.1V77.7h663v663H869v76.1h77.7c41.3 0 74.5-34 75.3-75.3V76.1c0-40.5-34-74.5-74.5-74.5z" p-id="14777"></path></svg>
                    </button>
                    <button id="close-btn" class="control-btn" @click="closeWindow">
                        <svg class="window-control-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4l6.6 6.6L8 22.6L9.4 24l6.6-6.6l6.6 6.6l1.4-1.4l-6.6-6.6L24 9.4z" fill="currentColor"></path></svg>
                    </button>
                </div>
            </a-layout-header>
            <template v-if="!isSubWindow">
                <a-layout class="layout-mother">
                    <a-layout-sider>
                        <a-menu
                        :default-selected-keys="['home']"
                        :style="{ width: '100%', marginTop: '20px' }"
                        :selected-keys="selectedKeys"
                        :tooltip-props = "{
                            popupVisible: false,
                        }"
                        @menu-item-click="onClickMenuItem"
                        >
                        <a-menu-item class="app-menu-item" key="home" >
                            <IconHome   :strokeLinecap="iconStrokeLinecap" :stroke-width="strokeWidth"/>
                            <!-- <span>主页</span> -->
                        </a-menu-item>
                        <a-menu-item class="app-menu-item" key="chat">
                            <icon-message   :strokeLinecap="iconStrokeLinecap" :stroke-width="strokeWidth" />
                            <!-- 聊天 -->
                        </a-menu-item>
                        <a-menu-item class="app-menu-item" key="contact">
                            <icon-user   :strokeLinecap="iconStrokeLinecap" :stroke-width="strokeWidth"/>
                            <!-- 联系人 -->
                        </a-menu-item>
                        <a-menu-item class="app-menu-item" key="setting">
                            <icon-settings   :strokeLinecap="iconStrokeLinecap"  :stroke-width="strokeWidth"/>
                            <!-- 设置 -->
                        </a-menu-item>
                        <!-- <a-menu-item class="app-menu-item" key="test">
                            <icon-robot   :strokeLinecap="iconStrokeLinecap" :stroke-width="strokeWidth" /> -->
                            <!-- 测试 -->
                        <!-- </a-menu-item> -->
                        </a-menu>
                    </a-layout-sider>
                    <!-- content -->
                    <!-- 此处路由插入组件 -->
                    <a-layout-content class="content-wrapper">
                        <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component :is="Component" />
                        </keep-alive>
                        </router-view>
                    </a-layout-content>
                </a-layout>
            </template>
            <template v-else>
                <!-- 子窗口专用简约布局 -->
                <router-view v-slot="{ Component }">
                    <component :is="Component" />
                </router-view>
            </template>
        </a-layout>
    </div>
</template>

<script setup>
import { IconHome, IconMessage, IconUser, IconSettings, IconRobot } from '@arco-design/web-vue/es/icon'
import { useRouter, useRoute } from 'vue-router'
import '@arco-design/web-vue/dist/arco.less'
import '@/theme.less'
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { subWindowEvents, windowEvents } from './shared/consts'
import { useChatStore } from './stores'
import { storeToRefs } from 'pinia'
import { roleEvents, modelEvents } from './shared/consts'

const selectedKeys = ref(['home'])       // 侧边栏选中项
const iconStrokeLinecap = ref('round');  // 侧边栏菜单图标描边类型
const strokeWidth = ref(3);             // 侧边栏菜单图标描边宽度

// 三大金刚键
const windowId = ref(null)
const isMaximized = ref(false)
const minimizeWindow = async () => {
    window.ipcRenderer.send(`${windowEvents.WINDOW_MINIMIZE + windowId.value}`)
}
const maximizeWindow = async () => {
    window.ipcRenderer.send(`${windowEvents.WINDOW_MAXIMIZE + windowId.value}`)
    isMaximized.value = !isMaximized.value
}
const closeWindow = async () => {
    window.ipcRenderer.send(`${windowEvents.WINDOW_CLOSE + windowId.value}`)
}

// 路由配置
const router = useRouter()      //你现在不一定要完全理解这段代码，关键是要知道可以通过
const route = useRoute()        //useRouter() 和 useRoute() 来访问路由器实例和当前路由
const isSubWindow = computed(() => route?.meta?.isSubWindow)
// 监听路由变化, 发送子窗口路由准备事件
watchEffect(() => {
  if (isSubWindow.value) {
    window.ipcRenderer.send(subWindowEvents.ROUTE_READY)
  }
})

const onClickMenuItem = (key) => {
  router.push({name: key})
  console.log(`点击菜单 ${key}`)
  selectedKeys.value[0] = key
  console.log('selectedKeys', selectedKeys.value)
}
// 路由与侧边栏菜单同步 刷新时, 如果在非home, 挂载函数就会跳转到home, 
// 因为默认任何页面App挂载就是home, 监听器改变了刷新时, 挂载的selectedKeys.value  
watchEffect(() => {
    // 路由名称不一定和菜单名称一致
    if (route.name === 'modelSetting') {
        selectedKeys.value[0] = 'setting'
    }
    else {
        selectedKeys.value[0] = route.name
    }
  console.log('路由变化 route.name: ', route.name, 'isSubWindow:', isSubWindow.value)
})



// 联系人状态管理
const store = useChatStore()
const { selectedContact, selectedChat } = storeToRefs(store)
const { loadContactList, selectContact, selectChat } = store           // 解构出方法 actions
const updateContactList = async () => {
  const roleProfilesJsonArray = await window.ipcRenderer.invoke(roleEvents.GET_ROLE_PROFILES)
  if (roleProfilesJsonArray.length > 0) {
      console.log('In App.vue, roleProfilesJsonArray', roleProfilesJsonArray)
      loadContactList(roleProfilesJsonArray)
      // 如果是重新编辑角色, 还需要更新已选中的联系人
      if (selectedContact.value && selectedContact.value.user_id) {
        const contact = roleProfilesJsonArray.find(item => item.user_id === selectedContact.value.user_id)
        if (contact) {
          selectContact(contact)
          // 如果当前会话对象也是被重新编辑的角色, 还要更新会话对象
          if (selectedChat.value && selectedChat.value.user_id === selectedContact.value.user_id) {
            selectChat(contact)
          }
        }
      }

  }
}
// 在组件创建时注册监听
onMounted( () => {
    updateContactList()
    window.ipcRenderer.on(roleEvents.UPDATE_CONTACTLIST, updateContactList)
    // 开发重载时, 回到主页, 保证菜单选中项与路由的统一
    // if (!isSubWindow.value && selectedKeys.value[0] !== 'home') {
    //   router.push({name: 'home'})
    //   console.log('组件挂载，进入主页, isSubWindow:', isSubWindow.value)
    // }
    console.log('组件挂载, isSubWindow:', isSubWindow.value, 'selectedKeys:', selectedKeys.value)
    window.ipcRenderer.send(modelEvents.INIT_CLOUD_API)
    // 获取窗体id
    window.ipcRenderer.on(windowEvents.WINDOW_ID, (event, windowId_) => {
        windowId.value = windowId_
    })
})
// 在组件销毁时移除监听
onBeforeUnmount(() => {
    window.ipcRenderer.removeListener(roleEvents.UPDATE_CONTACTLIST, updateContactList)
    window.ipcRenderer.removeAllListeners(windowEvents.WINDOW_ID)
})
</script>

<style scoped>
.app {
  /*border: 2px solid rgb(228, 11, 11);*/
  width: auto;
  height: 100vh;
  background-color: var(--color-ivory-light);
}
/*总体布局样式*/
.layout-mother {
  height: 100%;
  /*border: 3px solid green;*/
}
/*侧边栏样式*/
.layout-mother > :deep(.arco-layout-sider) {
  /*border: 2px solid red;*/
  width: auto !important;
  display: flex;
  justify-content: center;
}
/* 让菜单图标垂直居中 */
.layout-mother :deep(.arco-menu.arco-menu-light.arco-menu-vertical.arco-menu-collapsed.arco-menu-pop) {
  /*border: 2px solid blue;*/
  width: auto;
  display: flex;
  justify-content: center;
}
.layout-mother :deep(.arco-menu-inner) {
  /*border: 2px solid black;*/
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  width: auto;
  padding: 0 5px;
}
.layout-mother :deep(.arco-layout-sider .arco-menu-item.app-menu-item) {
  font-weight: bolder;
  height: 40px;
  /*border: 2px solid rgb(97, 10, 73);*/
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}
.layout-mother :deep(.arco-layout-sider .arco-menu-item.app-menu-item) > svg {
  width: 80%;
  height: 80%;
  margin-right: 0px;
}

/*Footer样式*/

/*content 内容样式*/
.content-wrapper {
  /*border: 2px solid red;*/
  position: relative;
}

.title-bar {
    -webkit-app-region: drag; /* electron 专属样式 允许拖动窗口 */
    background-color: white;
}

.window-controls {
    display: flex;
    -webkit-app-region: no-drag; /* electron 专属样式 禁止拖动窗口 */
}

.control-btn {
    border: none;
    background: none;
    width: 40px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.control-btn:hover {
    cursor: pointer;
    background-color: rgb(0, 0, 0, 0.1);
}
#close-btn:hover {
    background-color: var(--rust-450)
}

/* 三大金刚按钮图标样式 */
.window-control-icon {
    width: 22px;
    height: 100%;
}
#maximize-btn svg {
    width: 13px;
}
#minimize-btn svg {
    width: 15px;
}
</style>
