<template>
    <AudioBars isShowReverse :bars="bars" :barsStyle="{
        barWrapperWidth: '200px',
        barWrapperHeight: '200px',
        barWidth: '10px',
        motionBarBorderRadius: '5px'
    }"/>
    <audio id="audio" :src="props.voiceEngine" ref="audioPlayer" @pause="emits('audio-stop')" @playing="emits('audio-playing')" @ended="handleAudioEnded; emits('audio-stop')" @emptied="handleAudioEmptied"></audio>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Modal } from '@arco-design/web-vue'
import { sizes } from '../shared/consts'

const emits = defineEmits(['audio-playing', 'audio-stop'])

const props = defineProps({   // 音源
    voiceEngine: {
        type: String,
        default: '',
    },
    stopAudio: {
        type: Boolean,
        default: false,
    }
})

// 创建错误提示Modal
const createErrorModal = (content) => {
    Modal.error({
        modalClass: 'alki-modal-error',
        title: 'Error',
        content: content,
        modalStyle: {
            borderRadius: `${sizes.MODAL_BORDERRADIUS}px`,
            width: `${sizes.MODAL_WIDTH}px`,
            height: `${sizes.MODAL_HEIGHT}px`,
        },
    })
}

const defaultHeight = 2
const bars = ref(Array(5).fill({ height: defaultHeight }))

// 音频条测试
const audioPlayer = ref(null)
const isPlaying   = ref(false)   // 是否正在播放音乐 动态增加播放按钮类名
// 播放音乐函数
const playAudio = async () => {
    initAudio()
    if (audioPlayer.value.paused)
    {
        try {
            await audioPlayer.value.play()
        } catch (error) {
            isPlaying.value = false // 明确设置状态
            createErrorModal(`音源: ${props.voiceEngine} 无效 ${error}`)
            return // 可选：如果需要终止函数执行
        }
        isPlaying.value = true
    }
    else
    {
        audioPlayer.value.pause()
        isPlaying.value = false
    }
}
// 停止音乐函数
const stopAudio = () => {
    audioPlayer.value.pause()
    isPlaying.value = false
}

const handleAudioEnded = () => {
  isPlaying.value = false; // 同步播放状态
}

// 音源切换时触发
const handleAudioEmptied = () => {
    isPlaying.value = false; // 同步播放状态
}


// 创建音频上下文和分析器
let frequenceData = null
let analyser = null
let source = null
let audioContext = null
const initAudio = () => {
    if(!audioContext)
    {
        audioContext = new AudioContext()
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 32
        // 当音源无效时, 捕获无效错误, 提示用户音源错误
        try {
            source = audioContext.createMediaElementSource(audioPlayer.value)
        } catch (error) {
            console.log('音源无效', error)
        }
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        frequenceData = new Uint8Array(analyser.frequencyBinCount)
    }
}
// 音频数据处理函数 获取频谱数据并映射到音量柱数组
let animateId = null
const processAudioData = () => {

    if (audioPlayer.value && audioPlayer.value.paused)
    {
        bars.value = bars.value.map(() => {
            return {
                height: defaultHeight
            } 
        })
        if (animateId) 
        {
            cancelAnimationFrame(animateId)
        }
    }
    analyser.getByteFrequencyData(frequenceData)             // 获取频谱数据
    bars.value = bars.value.map((bar, index) => {
        let amp = Math.pow(frequenceData[index] / 255, 3) * 80;
        amp = Number.isNaN(amp) ? defaultHeight : amp
        amp = Math.max(defaultHeight, Math.min(100, amp)) // 钳制在2-100范围
        return { height: amp }
    })
    animateId = requestAnimationFrame(processAudioData)
}

// TTS成功自动播放
watch(() => props.voiceEngine, (newVal, oldVal) => {
    if (props.voiceEngine) {
        nextTick(() => {
            playAudio()
            processAudioData()
        })
    }
    else {
        stopAudio()
    }
})

// 外部组件控制停止播放
watch(() => props.stopAudio, (newVal) => {
    if (newVal) {
        stopAudio()
    }
})
</script>

<style scoped>
/*语音引擎试听按钮*/
.voice-listen-btn:hover svg{
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--success-450);
}
.voice-listen-btn.playing {
    color: var(--success-450) !important;
}
/*音频条容器样式*/
.voice-bars {
    border: none;
    margin-left: 10px;
    overflow: hidden;
    border-radius: 0%;
}
</style>

<style>
/* 更改错误提示框的页脚上边距 */
.alki-modal-error .arco-modal-footer {
    margin-top: 20px;
}
</style>