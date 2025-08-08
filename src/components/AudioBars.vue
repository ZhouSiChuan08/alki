<template>
    <div class="bar-wrapper"
        :style="{
            width: props.barsStyle.barWrapperWidth || '100px',
            height: props.barsStyle.barWrapperHeight || '100px',
        }">
        <div v-if="props.isShowReverse" v-for="(bar, index) in barsReverse" 
            :key="index" 
            class="bar"
            :style="{
                width: props.barsStyle.barWidth || '8px',
            }">
            <motion.div
            class="motion-bar"
            :initial="{ height: '0%' }"
            :animate="{ height: `${bar.height}%` }"
            :transition="{type: 'spring', damping: 30, stiffness: 500 }"
            :style="{
                borderRadius: props.barsStyle.motionBarBorderRadius || '5px',
            }">
            </motion.div>
        </div>
        <div v-for="(bar, index) in props.bars" 
            :key="index" 
            class="bar"
            :style="{
                width: props.barsStyle.barWidth || '8px',
            }">
            <motion.div
            class="motion-bar"
            :initial="{ height: '0%' }"
            :animate="{ height: `${bar.height}%` }"
            :transition="{type: 'spring', damping: 30, stiffness: 500 }"
            :style="{
                borderRadius: props.barsStyle.motionBarBorderRadius || '5px',
            }">
            </motion.div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { motion } from "motion-v"
const props = defineProps({
    isShowReverse: {           // 是否显示倒序的音频条 开启对称显示
        type: Boolean,
        default: false,
    },
    bars: {                    // 音频条数量及平静状态的高度
        type: Array,
        default: Array(15).fill({ height: 2 })
    },
    barsStyle: {
        type: Object,
        default: () => ({
            barWrapperWidth: '',         // 父容器的宽度
            barWrapperHeight: '',        // 父容器的高度
            barWidth: '',                // bars的宽度
            motionBarBorderRadius: '',   // bars的圆角
            
        }),
    }

})
const barsReverse = computed(() => [...props.bars].reverse())  // 反转音量柱数组
</script>

<style scoped>
/*父容器的参照样式*/

.bar-wrapper {
    /*width: 100px;*/
    /*height: 100px;*/
    /*border: 2px solid var(--blue-gray);*/
    /*border-radius: 50%;*/
    display: flex;
    justify-content: space-around;
    align-items: center;
    overflow: hidden;
}
.bar {
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
}
</style>