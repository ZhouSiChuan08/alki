<!-- 创建角色的配置界面 -->
<template>
    <a-layout class="create-role-layout">
        <div>
            <div class="create-role-title">卡片管理</div>
        </div>
        <a-layout-header class="create-role-header">
            <button v-for="btn in buttons"
                :key="btn.text"
                :class="['create-role-button', { 'active': btn.text === activeBtn }]"
                @click="activeBtn = btn.text; ChangeRoute(btn.routeName)">
                {{ btn.text }}
            </button>
        </a-layout-header>
        <hr class="create-role-hr">
        <a-layout-content class="create-role-content">
            <!-- 创建卡片表单组件 -->
            <router-view></router-view>
        </a-layout-content>
    </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 子窗口路由配置
const router = useRouter()        //你现在不一定要完全理解这段代码，关键是要知道可以通过
const route = useRoute()          //useRouter() 和 useRoute() 来访问路由器实例和当前路由
// 仅给当前点击按钮添加active类
const buttons = ref([
    {text: '创建卡片', routeName: 'profile'},
    // {text: '卡片库'  , routeName: 'Test'},
    // {text: '卡片市场', routeName: 'Test'}
])
const activeBtn = ref('创建卡片')  // 默认显示创建卡片
const ChangeRoute = (componentName) => {
    router.push({ name: componentName })
}
</script>

<style scoped>
.create-role-title {
    display: inline-block;
    margin: 15px 15px 15px 0px;
    font-size: 25px;
    font-weight: bolder;
    color: var(--olivine-450);
}
.create-role-layout {
    height: 100vh;
    background: var(--color-ivory-light);
}
.create-role-header {
    display: flex;
    justify-content: start;
}
.create-role-button {
    margin-right: 30px;
    margin-bottom: 5px;
    background: transparent;
    border: none;
    font-size: 18px;
    font-weight: bold;
}
.create-role-button:hover {
    cursor: pointer;
}
.create-role-button::after {
    content: '';
    display: block;
    width: 100%;
    height: 3px;
    background: var(--olivine-450);
    border-radius: 3px;
    transform: scaleX(0);  /* 初始状态隐藏 */
}
.create-role-button.active::after {
    transform: scaleX(1);  /* 鼠标悬停时显示 */
}
.create-role-button.active {
    color: var(--olivine-450);
}
/* 集体设置左外边距 */
.create-role-title,
.create-role-hr,
.create-role-button,
.create-role-content {
    margin-left: 15px;
}
/*集体设置右边距*/
.create-role-hr,
.create-role-content {
    margin-right: 15px;
}
</style>