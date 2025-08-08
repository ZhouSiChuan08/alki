<template>
    <h1>这是一个测试页面</h1>
    <button @click="makeSubWindow">生成子窗口</button>
    <TranslateBtn></TranslateBtn>
    <br>
    <AudioAutoPlayer :voiceEngine="mp3Path"></AudioAutoPlayer>
    <a-button type="primary" @click="mp3Path = exeDir + 'config/tts/沉稳男声.mp3'">播放1</a-button>
    <a-button type="primary" @click="mp3Path = exeDir + 'config/tts/沉稳女声.mp3'">播放2</a-button>
    <a-button type="primary" @click="mp3Path = ''">停止</a-button>
   
    


</template>
  
<script setup>
import { subWindowEvents } from '../../shared/consts'
import TranslateBtn from '../TranslateBtn.vue'
import AudioAutoPlayer from '../AudioAutoPlayer.vue'
import { ref } from 'vue'

const exeDir = import.meta.env.VITE_EXE_DIR  // 主程序运行目录
const defaultPostUrl = exeDir + 'config/post/defaultPost/defaultPost.png'
const makeSubWindow = () => {
    window.ipcRenderer.send(subWindowEvents.MAKE_ROLE, {
        options: {
            width:800,
            height:600,
            resizable: true,
            routerPath: '/sub/create-role'
        }, 
    })
}

const mp3Path = ref('')







</script>
<style scoped>


</style>