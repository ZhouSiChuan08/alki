<template>
    <AudioBars isShowReverse :bars="bars" :barsStyle="{
        barWrapperWidth: '200px',
        barWrapperHeight: '200px',
        barWidth: '10px',
        motionBarBorderRadius: '5px'
    }"/>
    <!-- <a-button v-if="isUseMic" type="primary" @click="getMicStream(); isUseMic = false">接入麦克风</a-button>
    <a-button v-if="!isUseMic" type="secondary" @click="isCloseMic = true; isUseMic = true">关闭麦克风</a-button> -->

</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import AudioBars from './AudioBars.vue'
import { saveEvents } from '../shared/consts'
// 录音相关
//必须引入的核心
import Recorder from 'recorder-core'
//录制wav格式的用这一句就行
import 'recorder-core/src/engine/wav'
//ts import 提示：npm包内已自带了.d.ts声明文件（不过是any类型）

// 录音保存完毕或发生错误, 通知父组件
const emit = defineEmits(['record-saved', 'error-occured'])
let rec
// 打开录音
function recOpenAndStart() {
        //创建录音对象
        rec = Recorder({
        type: 'wav', //录音格式，可以换成wav等其他格式
        sampleRate: 16000, //录音的采样率，越大细节越丰富越细腻
        bitRate: 16, //录音的比特率，越大音质越好
    })
    if (!rec) {
        alert('当前浏览器不支持录音功能！');
        return;
    }
    //打开录音，获得权限
    rec.open(
        () => {
        console.log('录音已打开')
        recStart()
        },
        (msg, isUserNotAllow) => {
        //用户拒绝了录音权限，或者浏览器不支持录音
        console.log((isUserNotAllow ? 'UserNotAllow, ' : '') + '无法录音:' + msg)
        emit('error-occured')
        },
    )
}

// 开始录音
function recStart() {
    if (!rec) {
        console.error('未打开录音')
        return
    }
    rec.start()
    console.log('已开始录音')
}
// 结束录音
function recStop() {
    if (!rec) {
        console.error('未打开录音');
        return;
    }
    rec.stop(
        (blob, duration) => {
        //blob就是我们要的录音文件对象，可以上传，或者本地播放
        //简单利用URL生成本地文件地址，此地址只能本地使用，比如赋值给audio.src进行播放，赋值给a.href然后a.click()进行下载（a需提供download="xxx.mp3"属性）
        const localUrl = (window.URL || window.webkitURL).createObjectURL(blob);
        console.log('录音成功', blob, localUrl, '时长:' + duration + 'ms');
        upload(blob); //把blob文件上传到服务器
        rec.close(); //关闭录音，释放录音资源，当然可以不释放，后面可以连续调用start
        rec = null;
        },
        (err) => {
        console.error('结束录音出错：' + err);
        emit('error-occured')
        rec.close(); //关闭录音，释放录音资源，当然可以不释放，后面可以连续调用start
        rec = null;
        },
    )
}

// 上传录音
async function upload(blob) {
    // 先将blob转为ArrayBuffer对象
    const arrayBuffer = await blob.arrayBuffer()
    // 发送到主进程
    console.log('In MicMonitor, 开始保存录音')
    const isSaved = await window.ipcRenderer.invoke(saveEvents.WAV, {folderName: 'wav', fileName: 'lord.wav', arrayBuffer: arrayBuffer})
    if (isSaved) {
        emit('record-saved')
        console.log('In MicMonitor, 录音文件已保存')
    }
}

const defaultHeight = 2
const bars = ref(Array(5).fill({ height: defaultHeight }))

const props = defineProps({
    isCloseMic: {
        type: Boolean,
        default: false
    }
})

// 获取麦克风输入
let audioContext = null   // 音频上下文
let animationId = null    // 管理动画
const getMicStream = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            audioContext = new AudioContext()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            source.connect(analyser)
            // 此行会实现类似耳返效果 会影响录音效果
            // analyser.connect(audioContext.destination)
            analyser.fftSize = 32
            const frequenceData = new Uint8Array(analyser.frequencyBinCount)
            console.log('In MicMonitor, 麦克风接入成功', source)

            // 分析音频数据 并显示音频条动画
            const voiceAnimate = () => {
                animationId = requestAnimationFrame(voiceAnimate)               // 注册循环调用函数,绘制动画
                analyser.getByteFrequencyData(frequenceData)                    // 获取频谱数据
                bars.value = bars.value.map((bar, index) => {
                    // 非线性放大 + 动态范围控制
                    // let amp = Math.pow(frequenceData[index] / 255, 3) * 80;
                    // amp = Number.isNaN(amp) ? 2 : amp
                    // amp = Math.max(2, Math.min(100, amp)) // 钳制在2-100范围
                    // return { height: amp }

                    let amplitude = frequenceData[index] / 255 * 100  // 转为0-100的音量值
                    amplitude = Number.isNaN(amplitude) ? defaultHeight : amplitude
                    amplitude = Math.max(defaultHeight, Math.min(100, amplitude)) // 钳制在2-100范围
                    return {
                        height: amplitude
                    }
                })

                // 关闭麦克风
                if (props.isCloseMic) 
                {
                    if (stream) 
                    {
                        // 停止所有轨道
                        stream.getTracks().forEach(track => track.stop())
                        // 断开音频节点 分析器连接 逻辑与短路求值语法更简洁 等价if (source) source.disconnect()
                        source && source.disconnect()
                        analyser && analyser.disconnect()
                        audioContext && audioContext.close()
                        audioContext = null
                        // 停止动画绘制
                        if (animationId) 
                        {
                            cancelAnimationFrame(animationId)
                            animationId = null
                            // 让音量柱回到原始状态
                            bars.value = bars.value.map(() => (
                                { height: defaultHeight}
                            ))
                        }
                        console.log('麦克风已关闭 资源已释放')
                        return
                    }    
                }
            }
            voiceAnimate()
        })
        .catch((error) => {
            console.log('麦克风接入失败', error)
        })
}

const isMounted = ref(false)
// 父组件关闭麦克风, 停止录音
watchEffect(() => {
    if (props.isCloseMic && rec) {
        recStop()
    }
    else {
        if (isMounted.value) {
            // 挂载时自动执行一次
            getMicStream()
            recOpenAndStart()
        }
    }
})

// 组件挂载时执行
onMounted(() => {
    isMounted.value = true
    // 为避免重复打开麦克风 此处不打开
})
// 组件销毁时执行
onUnmounted(() => {
    // 卸载时, 如果没停止, 手动停止录音
    if (!props.isCloseMic) {
        recStop()
    }
})
</script>

<style scoped>

</style>