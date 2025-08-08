<template>
    <div class="bar-circle-wrapper">
        <div v-for="(bar, index) in barsReverse" 
            :key="index" 
            class="bar">
            <motion.div
            class="motion-bar"
            :initial="{ height: '0%' }"
            :animate="{ height: `${bar.height}%` }"
            :transition="{type: 'spring', damping: 30, stiffness: 500 }">
            </motion.div>
        </div>
        <div v-for="(bar, index) in bars" 
            :key="index" 
            class="bar">
            <motion.div
            class="motion-bar"
            :initial="{ height: '0%' }"
            :animate="{ height: `${bar.height}%` }"
            :transition="{type: 'spring', damping: 30, stiffness: 500 }">
            </motion.div>
        </div>
    </div>
    <a-button type="primary" @click="updateBars">模拟输入音量</a-button>
    <br>
    <audio id="audio" :src="songSrc" ref="audioPlayer"></audio>
    <a-button type="primary" @click="playAudio();processAudioData()" :style="{marginTop: '10px'}">播放音乐</a-button>
    <a-button type="primary" @click="stopAudio" :style="{marginTop: '10px', marginLeft: '10px'}">停止音乐</a-button>
</template>

<script setup>
import { ref, computed } from "vue"
import { motion } from "motion-v"
const audioPlayer = ref(null)                                  // 音频播放器
const songSrc = ref("./music/张震岳&蔡健雅-思念是一种病.mp3")
const bars = ref(Array(15).fill({ height: 2 }))                // 音量柱数组

const barsReverse = computed(() => [...bars.value].reverse())  // 反转音量柱数组
// 更新音量柱高度函数
const updateBars = () => {
    bars.value = bars.value.map((bar, index) => {
        return {
            height: Math.random() * 80+10
        }
    })
}
// 播放音乐函数
const playAudio = () => {
    initAudio()
    audioPlayer.value.play()
}
// 停止音乐函数
const stopAudio = () => {
    audioPlayer.value.pause()
}
// 创建音频上下文和分析器
let frequenceData = null
let analyser = null
let source = null
let audioContext = null
const initAudio = () => {
    if(!audioContext)
    {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 32
        source = audioContext.createMediaElementSource(audioPlayer.value)
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        frequenceData = new Uint8Array(analyser.frequencyBinCount)
    }
}
// 音频数据处理函数 获取频谱数据并映射到音量柱数组
const processAudioData = () => {
    // 先清空柱数组
    // bars.value = bars.value.map(() => {
    //     return {
    //         height: 2
    //     }
    // })
    if (audioPlayer.value.paused) 
    {
        bars.value = bars.value.map(() => {
            return {
                height: 2
            }
        })
        return
    }
    analyser.getByteFrequencyData(frequenceData)             // 获取频谱数据
    bars.value = bars.value.map((bar, index) => {
        // let amplitude = frequenceData[index] / 255 * 100  // 转为0-100的音量值
        // amplitude = Number.isNaN(amplitude) ? 2 : amplitude
        // amplitude = Math.max(2, Math.min(100, amplitude)) // 钳制在2-100范围
        // return {
        //     height: amplitude
        // }
        // 非线性放大 + 动态范围控制
        let amp = Math.pow(frequenceData[index] / 255, 3) * 80;
        amp = Number.isNaN(amp) ? 2 : amp
        amp = Math.max(2, Math.min(100, amp)) // 钳制在2-100范围
        return { height: amp }
    })
    requestAnimationFrame(processAudioData)
}
</script>


<style scoped>
.bar-circle-wrapper {
    width: 300px;
    height: 300px;
    border: 2px solid var(--blue-gray);
    border-radius: 50%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    overflow: hidden;
}
.bar {
    width: 8px;
    height: 100%;
    position: relative;
    /*border: 1px solid var(--blue-gray);*/
}
.motion-bar {
    width: 100%;
    background: linear-gradient(to top, #bceb96,#2ecc71,#bceb96); /*#3498db, #2ecc71*/
    position: absolute;
    bottom: 50%; /* 从底部向上增长 */
    transform: translateY(50%);
    border-radius: 5px;
}
</style>