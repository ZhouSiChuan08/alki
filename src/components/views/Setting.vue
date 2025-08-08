<!-- 大模型配置界面 -->
<template>
    <a-layout class="setting">
        <div>
            <div class="setting-title">设置</div>
        </div>
        <a-layout-header class="setting-header">
            <button v-for="btn in buttons"
                :key="btn.text"
                :class="['setting-button', { 'active': btn.text === activeBtn }]"
                @click="activeBtn = btn.text; ChangeRoute(btn.routeName)">
                {{ btn.text }}
            </button>
        </a-layout-header>
        <hr class="setting-hr">
        <a-layout-content class="setting-content">
            <!-- 创建卡片表单组件 -->
            <!-- 保持组件状态不被销毁 -->
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
        </a-layout-content>
    </a-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 子窗口路由配置
const router = useRouter()        //你现在不一定要完全理解这段代码，关键是要知道可以通过
const route = useRoute()          //useRouter() 和 useRoute() 来访问路由器实例和当前路由
// 仅给当前点击按钮添加active类
const buttons = ref([
    {text: '模型设置', routeName: 'modelSetting'},
    // {text: '其他'  , routeName: 'test2'},
])
const activeBtn = ref('模型设置')  // 默认显示创建卡片
const ChangeRoute = (componentName) => {
    router.push({ name: componentName })
}

// 因为在setting时, 页面没有重载, 页面默认路由也不会加载, 需手动进行默认路由切换
// onMounted(() => {
//     if (route.name === 'setting') {
//         ChangeRoute('modelSetting')
//     }
// })
</script>

<style scoped>
.setting-title {
    display: inline-block;
    margin: 15px 15px 15px 0px;
    font-size: 25px;
    font-weight: bolder;
    color: var(--olivine-450);
}
.setting {
    height: 100%;
    background: var(--color-ivory-light);
}
.setting-header {
    display: flex;
    justify-content: start;
}
.setting-button {
    margin-right: 30px;
    margin-bottom: 5px;
    background: transparent;
    border: none;
    font-size: 18px;
    font-weight: bold;
}
.setting-button:hover {
    cursor: pointer;
}
.setting-button::after {
    content: '';
    display: block;
    width: 100%;
    height: 3px;
    background: var(--olivine-450);
    border-radius: 3px;
    transform: scaleX(0);  /* 初始状态隐藏 */
}
.setting-button.active::after {
    transform: scaleX(1);  /* 鼠标悬停时显示 */
}
.setting-button.active {
    color: var(--olivine-450);
}
/* 集体设置左外边距 */
.setting-title,
.setting-hr,
.setting-button,
.setting-content {
    margin-left: 15px;
}
/*集体设置右边距*/
.setting-hr,
.setting-content {
    margin-right: 15px;
}
</style>