<template>
    <a-button class="green-btn" :shape="props.shape" >
        <template #icon v-if="props.useIcon">
            <slot name="icon"></slot>
        </template>
        <slot></slot>  <!-- 默认插槽，用于接收组件标签内的内容 -->
    </a-button>
</template>

<script setup>

const props = defineProps({
    shape: {
        type: String,
        default: 'circle'
    },
    useIcon: {  // 默认空icon会显示一个空白的按钮, 影响按钮内容布局, 所以增加一个useIcon属性控制是否显示icon
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.green-btn {
    outline: none;
    background-image: linear-gradient(to top, #5d7946 0%, #87ae67 80%, #6d8e53 100%);
    transition: all 0.2s ease;
    color: #0c0c0c;
}
.green-btn:hover {
    box-shadow: 0 2px 1px 1px #97c374, 0 6px 8px #97c374, 0 -2px 1px #97c374, 
    0 -2px 1px #677a57, inset 0 0 2px 2px #6a7c5c;
    color: white;
}
.green-btn:active {
    box-shadow: 0 2px 1px 1px #b1dd8d, 0 2px 1px #82a565, 0 -2px 1px #82a565, 
    0 -2px 0px #b5e092, inset 0 0 3px 2px #5d7946, inset 0 0 30px #567042;
}
</style>