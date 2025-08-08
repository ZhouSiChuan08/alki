<template>
    <div class="audio-player-wrapper">
        <div class="audio-player-wave">
            <AudioBars :bars="waveList" :barsStyle="{
                barWrapperWidth: '300px',
                barWrapperHeight: '100px',
                barWidth: '5px',
            }">
            </AudioBars>
            <a-progress class="audio-progress" :percent="progressPercent * 0.01" :style="{width:'300px'}" :animation="true" :show-text="false" />
        </div>
        <div class="audio-player-buttons">
            <a-button class="audio-button-play-control" type="primary" shape="circle" @click="playAudio()">
                <IconPlayArrowFill v-if="!isPlaying" :size="24"/>
                <IconPause v-else :size="24"/>
            </a-button>
            <span>{{ currentTimeStr }} / {{ durationTimeStr }}</span>
            <a-button class="audio-button-select-audio" type="primary"  shape="round" @click="audioInput.click()">
                选择音频
                <input class="audio-input" ref="audioInput" type="file"
                    accept="audio/mp3, audio/wav"
                    @change="selectAudioFile"
                >
            </a-button>
            
        </div>
        <audio :src="selectedAudioUrl" ref="audio" @loadedmetadata="getAudioTime" @timeupdate="updateAudioTime"
            @play="isPlaying = true" @pause="isPlaying = false" @ended="isPlaying = false" @emptied="isPlaying = false"   
        >
        </audio>
    </div>

</template>

<script setup>
import { ref, onMounted, computed} from 'vue'
import AudioBars from './AudioBars.vue'
import { IconPlayArrowFill, IconPause } from '@arco-design/web-vue/es/icon'


const audio = ref(null)             // 音频元素引用
let audioContext                    // 音频处理上下文
const selectedAudioUrl = ref('')    // 选中的音频 URL
const audioInput = ref(null)        // 音频文件输入入口
const waveList = ref([])            // 时域音频幅值列表
const currentTime = ref(0)          // 当前播放时间
const duration = ref(0)             // 音频总时长
const progressPercent = ref(0)      // 进度百分比

const currentTimeStr = computed(() => formatTime(currentTime.value))
const durationTimeStr = computed(() => formatTime(duration.value))

const isPlaying = ref(false)        // 是否正在播放

const props = defineProps({
    samples: {  // 采样点数 控制波形精度
        type: Number,
        default: 100
    }
})

const emits = defineEmits(['audio-file-path'])
const selectAudioFile = async (event) => {
    const { files } = event.target
    if (files[0]) {  // 至少选中一个文件
        // 检查文件类型
        const allowedTypes = ["audio/mpeg", "audio/wav"]
        if (!allowedTypes.includes(files[0].type)) {
            alert("仅支持 MP3 和 WAV 文件!");
            return;
        }
        if (files[0].size > 10 * 1024 * 1024) {
            alert("文件大小不能超过 10MB!");
        }
        selectedAudioUrl.value = URL.createObjectURL(files[0])
        // 处理音频数据 得到时域的音频幅值列表
        const waveform  = await processAudioData(files[0])
        waveList.value = waveform.map(item => ({ height: item }))
        emits('audio-file-path', files[0].path)
    }
}

// 将音频文件转换为ArrayBuffer 输入文件对象
const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}


// 获取时域的音频幅值
const getAudioWaveform = (audioBuffer) => {
    const channelData = audioBuffer.getChannelData(0)  // 获取第一个声道的数据                          
    const step = channelData.length / props.samples          // 步长
    const waveform = []
    // 提取采样点
    for (let i = 0; i < props.samples; i++) {
        const index = Math.floor(i * step)
        waveform.push(Math.abs(channelData[index]) * 150)
    }
    return waveform
}

// 处理音频数据
const processAudioData = async (audioFile) => {
    const arrayBuffer = await readFileAsArrayBuffer(audioFile)
    // 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    // 获取时域的音频幅值
    return getAudioWaveform(audioBuffer)
}

// 时间格式化工具函数（秒 -> 分:秒）
const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  
  // 确保秒数显示为两位数
  return `${mins}:${secs < 10 ? '0' + secs : secs}`
}

// 获取音频时长
const getAudioTime = () => {
    if (audio.value) {
        duration.value = audio.value.duration
    }
}
// 更新当前播放时间和百分比
const updateAudioTime = () => {
    if (audio.value) {
        currentTime.value = audio.value.currentTime
        progressPercent.value = (currentTime.value / duration.value) * 100 || 0
    }
    else {
        cancelAnimationFrame(animateId)
    }
}

const playAudio = async () => {
    if (audio.value && audio.value.src) {
        if (audio.value.paused)
        {
            try {
                await audio.value.play()
            } catch (error) {
                isPlaying.value = false // 明确设置状态
                return // 可选：如果需要终止函数执行
            }
            isPlaying.value = true
        }
        else
        {
            audio.value.pause()
            isPlaying.value = false
        }
    }
}


onMounted(() => {
    audioContext = new AudioContext()
})
</script>

<style scoped>
.audio-input {
    display: none;
}
.audio-player-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.audio-player-buttons {
    width: 300px;
    display: flex;
    justify-content:flex-start;
    align-items: center;
    margin-top: 5px;
}
.audio-button-select-audio {
    margin-left: auto;
}
.audio-button-play-control {
    margin-right: 10px;
}
.audio-player-wave {
    position: relative;
    display: flex;
    flex-direction: column;
    background-color: var(--color-ivory-shoadow);
    border-radius: 8px;
    height: 100px;
    overflow: hidden;
}
/*调整进度条的位置*/
.audio-progress {
   position: absolute;
   top: 90px;
}
</style>