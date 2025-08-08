<template>
    <a-button class="translate-btn" shape="circle" @click="translate(props.sourceText)">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><path d="M12.65 15.67c.14-.36.05-.77-.23-1.05l-2.09-2.06l.03-.03A17.52 17.52 0 0 0 14.07 6h1.94c.54 0 .99-.45.99-.99v-.02c0-.54-.45-.99-.99-.99H10V3c0-.55-.45-1-1-1s-1 .45-1 1v1H1.99c-.54 0-.99.45-.99.99c0 .55.45.99.99.99h10.18A15.66 15.66 0 0 1 9 11.35c-.81-.89-1.49-1.86-2.06-2.88A.885.885 0 0 0 6.16 8c-.69 0-1.13.75-.79 1.35c.63 1.13 1.4 2.21 2.3 3.21L3.3 16.87a.99.99 0 0 0 0 1.42c.39.39 1.02.39 1.42 0L9 14l2.02 2.02c.51.51 1.38.32 1.63-.35zM17.5 10c-.6 0-1.14.37-1.35.94l-3.67 9.8c-.24.61.22 1.26.87 1.26c.39 0 .74-.24.88-.61l.89-2.39h4.75l.9 2.39c.14.36.49.61.88.61c.65 0 1.11-.65.88-1.26l-3.67-9.8c-.22-.57-.76-.94-1.36-.94zm-1.62 7l1.62-4.33L19.12 17h-3.24z" fill="currentColor"></path></svg>
    </a-button>
</template>

<script setup>
import { chatEvents } from '../shared/consts'

const props = defineProps({
    sourceText: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['translated'])

const translate = async (sourceText) => {
    const targetText = await window.ipcRenderer.invoke(chatEvents.TRANSLATE, sourceText)
    console.log('In TranslateBtn.vue, 翻译结果：', targetText)
    emit('translated', targetText)
}


</script>

<style scoped>
svg {
    width: 80%;
    height: auto;
}

.translate-btn {
    width: 25px;
    height: 25px;
    border: none;
    background: var(--olivine-450);
    color: var(--color-ivory-shoadow);
    margin-left: 12px;
}
.translate-btn:hover {
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--success-450);
    color: var(--color-ivory-shoadow);
}

</style>