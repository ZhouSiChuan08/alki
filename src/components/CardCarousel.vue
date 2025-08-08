<template>
    <div class="card-carousel-mother-wrapper">
        <div class="card-carousel-mother" ref="carouselMother">
            <!-- 再复制倒数第二张 用以瞬间跳转 -->
            <div class="card-carousel-container"
                :style="getCardContainerStyle('L1')">
                <RoleCard :info="cards[cards.length-2]"></RoleCard>
            </div>
            <!-- 在开头复制最后一张 把第一张在起始时挤到中心位置 -->
            <div class="card-carousel-container"
                :style="getCardContainerStyle('L2', isHoveredL2)"
                tabindex="0"
                @mouseenter="isHoveredL2 = true" @mouseleave="isHoveredL2 = false" @blur="isHoveredL2 = false">
                <RoleCard :info="cards[cards.length-1]"></RoleCard>
            </div>

            <div class="card-carousel-container"
                v-for="(card, index) in cardsWithKey"
                :key="index"
                :style="getCardContainerStyle(card.key, isHoveredList[index])"
                tabindex="0"
                @mouseenter="isHoveredList[index] = true" @mouseleave="isHoveredList[index] = false" @blur="isHoveredList[index] = false">
                <RoleCard :info="card"></RoleCard>
            </div>

            <!-- 在末尾复制第一张 -->
            <div class="card-carousel-container"
                :style="getCardContainerStyle('R1', isHoveredR1)"
                tabindex="0"
                @mouseenter="isHoveredR1 = true" @mouseleave="isHoveredR1 = false" @blur="isHoveredR1 = false">
                <RoleCard :info="cards[0]"></RoleCard>
            </div>
            <!-- 再复制第二张 用以瞬间跳转 -->
            <div class="card-carousel-container"
                :style="getCardContainerStyle('R2')">
                <RoleCard :info="cards[1]"></RoleCard>
            </div>
        </div>
        <div class="nav-btn-wrapper">
            <button class="nav-btn prev" @click="prev" @mouseenter="isHoveredBtn = true" @mouseleave="isHoveredBtn = false">
                <icon-caret-left :size="iconSize" :strokeLinecap="iconStrokeLinecap" :iconStrokeLinejoin="iconStrokeLinejoin" />
            </button>
            <button class="nav-btn next" @click="next" @mouseenter="isHoveredBtn = true" @mouseleave="isHoveredBtn = false">
                <icon-caret-right :size="iconSize" :strokeLinecap="iconStrokeLinecap" :iconStrokeLinejoin="iconStrokeLinejoin" />
            </button> 
        </div>       
    </div>
    

</template>

<script setup>
import { IconCaretLeft, IconCaretRight } from '@arco-design/web-vue/es/icon'
import { ref, computed ,onMounted, onBeforeUnmount, nextTick } from 'vue'
import RoleCard from './RoleCard.vue'
import { toolFuns } from '../shared/toolFuns'
const props = defineProps({
    cards: {
        type: Array,
        required: true,
        default: () => []
    },
    interval: {
        type: Number,
        default: 3000
    }
})
// 为每张卡片添加key键 用以动画效果
const cardsWithKey = computed(() => {
    return toolFuns.addIndexToArr(props.cards)
})
const iconSize = ref(15)                 // 按钮内图标大小
const iconStrokeLinecap = ref('round')   // 按钮内图标描边类型
const iconStrokeLinejoin = ref('round')  // 按钮内图标拐角类型
const carouselMother = ref(null)     //  根父组件的引用
const carouselMotherWidth = ref(0)   //  根父组件中，卡片宽度变量 --card-width 的值
const carouselMotherGap = ref(0)     //  根父组件中，卡片间距变量 --card-gap 的值
const carouselMotherGapRate = ref(0) //  根父组件中，卡片间距比率变量 --card-gap-rate = --card-gap/--card-width 的值
const currentIndex = ref(0)          //  当前视觉重心卡片的索引
const transform = ref('')            //  卡片的 transform 样式 包含位移 放大
const defaultTransiton = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
const transition = ref(defaultTransiton)           //  卡片的 transition 样式 控制卡片的过渡动画
const defaultTranslateX = computed(() => {         //  卡片的 translateX 样式 控制卡片的位移
    return `translateX(-${(currentIndex.value + 1) * (100 +  carouselMotherGapRate.value)}%)`
})
let onLeft = false               // 状态: 是否处于最左侧
let onRight = false              // 状态: 是否处于最右侧
const isHoveredList = ref(Array(props.cards.length).fill(false))   // 状态: 是否处于鼠标悬停状态
const isHoveredL2 = ref(false)   // 状态: L2是否处于鼠标悬停状态
const isHoveredR1 = ref(false)   // 状态: R1是否处于鼠标悬停状态
const isHoveredBtn = ref(false)  // 状态: 按钮是否处于鼠标悬停状态
const autoPlayTimer = ref(null)  // 自动播放定时器

// 获取style scoped的样式变量
const getMotherStyleVar = () => {
    if(carouselMother.value) {
        const style = window.getComputedStyle(carouselMother.value)
        carouselMotherWidth.value = parseInt(style.getPropertyValue('--card-width'), 10)
        carouselMotherGap.value = parseInt(style.getPropertyValue('--card-gap'), 10)
        carouselMotherGapRate.value = (carouselMotherGap.value / carouselMotherWidth.value) * 100
        //console.log(`carouselMotherWidth: ${carouselMotherWidth.value}, carouselMotherGapRate: ${carouselMotherGapRate.value}`)
    }
    transform.value = defaultTranslateX.value
}

// 返回卡片样式
const getCardContainerStyle = (cardKey, isHovered) => {
    let scaleValue = 1
    let opacityValue = 0.5
    let hoveredStyle = ''
    if(cardKey === currentIndex.value) {  // 视觉重心卡片
        opacityValue = 1
    }else{
        scaleValue = 0.8
    }
    if (onLeft === true && cardKey === 0) {
        opacityValue = 0.5
        scaleValue = 0.8
    }
    if (onLeft === true && cardKey === 'L2') {
        opacityValue = 1
        scaleValue = 1
    }
    if (onRight === true && cardKey === props.cards.length - 1) {
        opacityValue = 0.5
        scaleValue = 0.8
    }
    if (onRight === true && cardKey === 'R1') {
        opacityValue = 1
        scaleValue = 1
    }
    opacityValue = (onLeft === true && cardKey === 0) ? 0.5 : opacityValue
    opacityValue = (onLeft === true && cardKey === 'L2') ? 1 : opacityValue
    opacityValue = (onRight === true && cardKey === props.cards.length - 1) ? 0.5 : opacityValue
    opacityValue = (onRight === true && cardKey === 'R1') ? 1 : opacityValue
    if (isHovered === true) {
        scaleValue = 1
        hoveredStyle = `translateY(-20px)`
    }else {
        hoveredStyle = ''
    }
    return{
        transform: transform.value + ` scale(${scaleValue})` + ` ${hoveredStyle}`,
        transformOrigin: 'bottom center',
        transition: transition.value,
        opacity: opacityValue
    }
}

// 下一张
const next = async () => {
    if (currentIndex.value === props.cards.length - 1) {  // 点击next时，处于最后一张
        // 瞬间跳转到最后一张 取消过渡动画
        onLeft = true
        transition.value = ''
        transform.value = `translateX(0%)`
        await nextTick()  // 解决首次加载 动画消失问题
        setTimeout( () => {
            onLeft = false
            transform.value = defaultTranslateX.value
            transition.value = defaultTransiton
        }, 0)
        currentIndex.value = 0;  // 回到第一张
    }else {
        currentIndex.value++;    // 点击next时，切换到下一张
        transform.value = defaultTranslateX.value
    }
    // console.log(`currentIndex: ${currentIndex.value}`)
}
// 上一张
const prev = () => {
    if (currentIndex.value === 0) {  // 点击prev时，处于第一张
        // 瞬间跳转到最后一张 取消过渡动画
        onRight = true
        transition.value = ''
        transform.value = `translateX(-${(props.cards.length + 1) * (100 +  carouselMotherGapRate.value)}%)`
        setTimeout( () => {
            onRight = false
            transform.value = defaultTranslateX.value
            transition.value = defaultTransiton
        }, 0)
        currentIndex.value = props.cards.length - 1;  // 回到最后一张
    }else {
        currentIndex.value--;  // 点击prev时，切换到上一张
        transform.value = defaultTranslateX.value
    }
    // console.log(`currentIndex: ${currentIndex.value}`)
}
// 自动播放
const autoPlay = () => {
    autoPlayTimer.value = setInterval(() => {
        if (!(isHoveredL2.value || isHoveredR1.value || isHoveredList.value.some(item => item) || isHoveredBtn.value)) {
            next()
        }
    }, props.interval)
}
// 停止播放
const pauseAutoPlay = () => clearInterval(autoPlayTimer.value)

// 挂载组件时运行函数
onMounted(() => {
    transition.value = '' // 组件挂载时，取消过渡动画
    getMotherStyleVar()
    requestAnimationFrame(() => {
        transition.value = defaultTransiton
    })
    autoPlay()
})
// 卸载组件时运行函数
onBeforeUnmount(() => {
    pauseAutoPlay()
})

</script>

<style scoped>
.card-carousel-mother-wrapper {
    position: relative;
    outline: 10px solid var(--olivine-450);
    border-radius: 10px;
}
.card-carousel-mother {
  --card-gap: 30px;
}
.card-carousel-mother {
    width: calc(var(--card-width) * 3 + var(--card-gap) * 2);
    height: 300px;
    display: flex;
    overflow: hidden;
    gap: 0 var(--card-gap);
    align-items: center;
    /*border: 1px solid #d30d0d;*/
    box-shadow:inset 0 0px 20px rgba(79, 78, 76, 0.5); /* 添加阴影边框 */
    background: var(--color-ivory-light);
    border-radius: 10px;
}

.card-carousel-container:hover {
    cursor: pointer;
    filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5));
    opacity: 1 !important;
}
/*按钮容器*/
.nav-btn-wrapper {
    display: flex;
    width: 40%;
    height: 20px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 2px;
}

/* 按钮样式 */
.nav-btn {
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  width: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  border: 0.5px solid #445536;
  outline: none;
  background-image: linear-gradient(to top, #5d7946 0%, #87ae67 80%, #6d8e53 100%);
  transition: all 0.2s ease;
  font-family: "Source Sans Pro", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #0c0c0c;
}
.nav-btn:hover {
    box-shadow: 0 2px 1px 1px #97c374, 0 6px 8px #97c374, 0 -2px 1px #97c374, 
    0 -2px 1px #677a57, inset 0 0 2px 2px #6a7c5c;
    color: white;
}
.nav-btn:active {
    box-shadow: 0 2px 1px 1px #b1dd8d, 0 2px 1px #82a565, 0 -2px 1px #82a565, 
    0 -2px 0px #b5e092, inset 0 0 3px 2px #5d7946, inset 0 0 30px #567042;
}
.prev {
    border-radius: 30px 0 0 30px;
}
.next {
    border-radius: 0 30px 30px 0;
}
</style>