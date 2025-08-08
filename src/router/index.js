// router/index.js
import { createRouter, createWebHashHistory } from 'vue-router' // 必须使用 hash 模式
// 主组件
import Home from '../components/views/Home.vue'
import Chat from '../components/views/Chat.vue'
import Contact from '../components/views/Contact.vue'
import Setting from '../components/views/Setting.vue'
import Test from '../components/views/Test.vue'

// 子组件
import CreateRole from '../components/CreateRole.vue'
import RoleProfile from '../components/RoleProfile.vue'
import ModelSetting from '../components/ModelSetting.vue'

const router = createRouter({
  history: createWebHashHistory(),  // Electron 本地文件协议需要 hash 模式 兼容file://协议
  routes: [
    { path: '/', redirect: '/home' },                                        // 默认将根路径跳转到 home
    { path: '/home',     name: 'home',     component: Home },
    { path: '/chat/:voice?/:randomChatText?',     name: 'chat',     component: Chat },  // 任何类型的路径参数都会被转成字符串
    { path: '/contact',  name: 'contact',  component: Contact },
    { path: '/setting',  name: 'setting',  component:  Setting, 
      redirect: { name: 'modelSetting' }, // 强制重定向 父路由有名字,path: ''路由不起作用,需要手动重定向
      children: [
        { path: '',    name: 'modelSetting', component: ModelSetting },
        { path: '',    name: 'test2',        component: Test }
      ] 
    },
    { path: '/test',     name: 'test', component: Test },
    // 子窗口专属路由
    { path: '/sub/create-role', 
      component: CreateRole, 
      meta: { isSubWindow: true },
      children: [
        {
          path: '',        // 子路径/profile → 直接匹配/profile 不再嵌套
          name: 'profile',
          component: RoleProfile,
        },
        {
          path: '',              // 空路径表示/sub/create-role的默认渲染目标
          name: 'Test',
          component: Test,
        }
      ]
    },
  ]
})
export default router  // 导出 router