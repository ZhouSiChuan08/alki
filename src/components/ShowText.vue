<!-- 此模块已弃用 -->
<template>
    <div class="show-text-container">
    </div>
</template>

<script setup>
    import { watch, createVNode, render } from 'vue';
    import markdown from './markdown.vue';
    import TextBubble from './TextBubble.vue';
    // 从外部接收对象并显示在容器内
    const props = defineProps({
        inputText: {
            type: Object,
            default: () => ({   // 括号表示返回对象 可以少写一个return
                sender: '',
                string:'',
                isStop: false,
                sendStatus: 'wait',  // 发送状态 wait:等待发送 success:发送成功 fail:发送失败
            }),
        }
    });

    // 存储已累计文本
    let accumulateText   = ''
    // 存储当前mdNode
    let mdNode           = null
    let textBubbleNode  = null
    // 存储渲染的容器元素
    let newAiTextWrapper = null
    let newUserTextWrapper  = null

    // 监听props的变化，并更新容器内的文本
    watch(() => props.inputText, async (newVal, oldVal) => {
        const showTextContainer = document.querySelector('.show-text-container');
        if (newVal.sender === 'user') 
        {
            if (newVal.isStop) {  // 文本传输状态确定
                const textBubbleInstance = textBubbleNode.component;  // 获取组件实例
                if(textBubbleInstance)
                {
                    console.log('In ShowText.vue, 发送内容:', newVal.string, '\n发送状态',newVal.sendStatus);
                    textBubbleInstance.props.message = {string: newVal.string, sendStatus: newVal.sendStatus}  // 这里可以传递更多参数给TextBubble组件
                    textBubbleInstance.update();  // 更新组件
                }
                textBubbleNode = null
                newUserTextWrapper = null
            }
            else
            {
                if (!newUserTextWrapper) {  // 用户文本容器不存在
                    newUserTextWrapper = document.createElement('div');
                    newUserTextWrapper.className = 'show-user-text-wrapper';
                    textBubbleNode = createVNode(TextBubble, { message: {string: newVal.string, sendStatus: newVal.sendStatus} })
                    render(textBubbleNode, newUserTextWrapper);
                    showTextContainer.appendChild(newUserTextWrapper);
                }
            }
        }
        else
        {
            accumulateText += newVal.string;
            // console.log(`accumulateText:${accumulateText}`);
            // isStop为true时将虚拟节点置null, newAiTextWrapper(dom div)置null
            if (newVal.isStop) {
                accumulateText = '';
                mdNode = null;
                newAiTextWrapper = null;
            }
            else
            {
                if (!newAiTextWrapper) 
                {
                    newAiTextWrapper = document.createElement('div');
                    newAiTextWrapper.className = 'show-ai-text-wrapper';
                    // 动态插入markdown组件
                    mdNode = createVNode(markdown, {textObject: {string: accumulateText}});
                    // 挂载组件 渲染组件到newAiTextWrapper中
                    render(mdNode, newAiTextWrapper);
                    showTextContainer.appendChild(newAiTextWrapper);
                }
                else
                {
                    // 再次传递props消息给markdown组件，更新渲染内容
                    // mdNode.props.textObject = {string: accumulateText, time: newVal.time};
                    // // 重新渲染组件
                    // render(mdNode, newAiTextWrapper);
                    // showTextContainer.appendChild(newAiTextWrapper);
                    // 另一种写法
                    const mdInstance = mdNode.component;  // 获取组件实例
                    if(mdInstance)
                    {
                        mdInstance.props.textObject = {string: accumulateText};  // 这里可以传递更多参数给markdown组件
                        mdInstance.update();  // 更新组件
                    }
                }
            } 
        }
        showTextContainer.scrollTop = showTextContainer.scrollHeight;
    });
</script>

<style scoped>
    .show-text-container {
        display: flex;
        flex-direction: column;
        /*border: 2px solid #3f15ca;*/
        max-height: 100%;
        overflow: auto;
    }
    /*输入框滚动条样式 */
    .show-text-container::-webkit-scrollbar { /* 修改滚动条样式 */
        width: 0.5rem; /* 滚动条的宽度 */
    }
    .show-text-container::-webkit-scrollbar-track {
        background-color: none;
    }
    .show-text-container::-webkit-scrollbar-thumb {
        border-radius: 5px; /* 滚动条的圆角 */
        visibility: hidden; /* 滚动条不可见 */
    }
    .show-text-container:hover::-webkit-scrollbar-thumb {
        background: #a1a777; /* 滚动条的颜色 */
        visibility: visible; /* 滚动条可见 */
    }
</style>

<style>
    .show-user-text-wrapper {
        align-self: flex-end;
        margin-bottom: 1rem;
        margin-right: 1rem;
    }
    .show-ai-text-wrapper {
        margin-bottom: 1rem;
        margin-left: 1rem;
        align-self: flex-start;
        max-width: 80%;
        border-radius: 1rem;
    }    
</style>