<template>
    <div>
        <!-- markdown渲染区域 -->
        <div id="markdown-output" ref="markdownOutput"></div>
    </div>
</template>

<script setup>
import { ref, watchEffect, onMounted} from 'vue';
import MarkdownIt from 'markdown-it'
import MarkdownItCopy from 'markdown-it-copy/index.js'; 
import hljs from 'highlight.js';
import katex from 'katex';
import hljsPlugin from 'markdown-it-highlightjs';
import markdownItKatexGpt from 'markdown-it-katex-gpt'
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.css';
import 'markdown-it-copy/theme/default.css'

const markdownOutput = ref(null);

// markdown渲染函数
const renderMarkdown = new MarkdownIt();
renderMarkdown.use(hljsPlugin, {
    inline: true,
});
const options = {
    btnText: 'Copy', // 'copy' | button text
    failText: 'Copy failed', // 'copy fail' | copy-fail text
    successText: 'Copied!', // 'copy success' | copy-success text
    successTextDelay: 2000, // 2000 | successText show time [ms]
    // extraHtmlBeforeBtn: '复制代码', // '' | a html-fragment before <button>
    // extraHtmlAfterBtn: String, // '' | a html-fragment after <button>
    showCodeLanguage: true, // false | show code language before [btn || extraHtmlBeforeBtn] | [add-after-1.1.0]
    // attachText: String, // '' | some text append copyText， Such as: copyright | [add-after-1.2.0]
};
renderMarkdown.use(MarkdownItCopy, options);
renderMarkdown.use(markdownItKatexGpt, {
  delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
  ]
});
// renderMarkdown.use(katexPlugin, {"throwOnError" : false, "errorColor" : " #cc0000"});
const props = defineProps({
    textObject: {
        type: Object,
        default: () => ({
            string:'',
        }),
    }
});

onMounted(() => {
    // 监听props.text变化，渲染markdown
    watchEffect(() => {
        const html = renderMarkdown.render(props.textObject.string);
        if(html && markdownOutput.value)
        {
            const output = markdownOutput.value;
            output.innerHTML = html;
            // renderMathInElement(output, renderOption);
        }
    });
});

</script>

<style scoped>
    #markdown-output {
        padding: 1rem;
        /*border: 0.2rem solid #0b8fc4;*/
        background: var(--color-ivory-medium);
        border-radius: 10px;
        line-height: 1.5;
    }
</style>

<!-- 全局样式 -->
<style>
    /* 重新设置代码块字体 */
    code[class*="hljs"]{
        font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        line-height: 1.5;
    }
    code[class*="hljs"]:not(pre code[class*="hljs"]){  /*内嵌代码块外层样式*/
        background-color: #f7f1f1;
        color: black;             
        font-weight: bold;
        border-radius: 0.4rem;
    }
    span[class*="hljs"]:not(pre code span[class*="hljs"]) {  /*内嵌代码块样式*/
        color: black;
        background-color: #f7f1f1;
        font-weight: bold;
    }
    /* 给复制工具栏留出空间 */
    pre {
        padding-top: 1rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    /* 设置段落 横线的样式 */
    #markdown-output hr {
        display: block;
        unicode-bidi: isolate;
        margin-block-start: 1rem;
        margin-block-end: 1rem;
        margin-inline-start: auto;
        margin-inline-end: auto;
        overflow: hidden;
        border-style: inset;
    }
    #markdown-output h1,
    #markdown-output h2,
    #markdown-output h3,
    #markdown-output h4,
    #markdown-output h5 {
        margin-top: 1.5rem; 
        margin-bottom: 1.5rem; 
    }
    #markdown-output table {
        border-collapse: collapse; /* 确保边框合并 */
        width: 100%; /* 可选：让表格占满容器宽度 */
    }

    #markdown-output th,
    #markdown-output td {
        border: 2px solid rgba(0, 0, 0, 0.2);; /* 为每个单元格添加边框 */
        padding: 8px; /* 可选：为单元格内容添加内边距 */
    }
    #markdown-output tr:nth-child(even) {
        background-color: #f2f2f2; /* 偶数行的背景色 */
    }

    #markdown-output tr:nth-child(odd) {
        background-color: #ffffff; /* 奇数行的背景色 */
    }

</style>