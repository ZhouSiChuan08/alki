<template>
  <div class="card-carousel">
    <div class="image-container-mother">
      <!-- 复制最后一张 -->
      <div class="image-container">
         <img class="image" :src="images[images.length - 1]" alt=""
         :style="{
            transform: transform || `translateX(-${currentIndex + 1}00%)`,
            transition: transition
          }">
      </div>
      <div class="image-container"
      v-for="(image, index) in images"
      :key="index"
      :style="{
        transform: transform || `translateX(-${currentIndex + 1}00%)`,
        transition: transition
      }"
      >
      <img class="image" :src="image" alt="">
      </div>
      <!-- 复制第一张 -->
      <div class="image-container">
         <img class="image" :src="images[0]" alt=""
         :style="{
            transform: transform || `translateX(-${currentIndex + 1}00%)`,
            transition: transition
          }">
      </div>
     <!-- 指示器  -->
      <ul class="indicator">
        <li class="indicator-item"
        v-for="(image, index) in images"
        :key="index"
        :style="{
          backgroundColor: index === currentIndex ? 'white' : 'gray',
        }"
        @click="changeIndex(index)"
        ></li>
      </ul>
    </div>
    <button class="nav-btn prev"  @click="prev">‹</button>
    <button class="nav-btn next"  @click="next">›</button>

  </div>

</template>


<script setup>
import { ref } from 'vue'

const currentIndex = ref(0)
const transform = ref('')
const transition = ref('transform 0.5s ease-in-out')
const images = [
  '/pic1.jpg',
  '/pic2.jpg',
  '/pic3.jpg',
]
// 点击圆点切换卡片
const changeIndex = (index) => {
  console.log(`点击的li Index: ${index}`);
  currentIndex.value = index
  console.log(`当前li Index: ${index} currentIndex.value: ${currentIndex.value} `)
}
// 点击左右按钮切换卡片
const prev = () => {
  if ( currentIndex.value === 0) {  // 点击prev时 处于第一张卡片
    transition.value = ''
    transform.value = `translateX(-${images.length + 1}00%)`
    // 跳转到最后一项
    requestAnimationFrame(() => {
      transform.value = '';
      transition.value = 'transform 0.5s ease-in-out';
    })
    currentIndex.value = images.length - 1
  }else {
    currentIndex.value--
  }
}
const next = () => {
  if ( currentIndex.value === images.length - 1) {  // 点击next时 处于最后一张卡片
    transition.value = '';
    transform.value = 'translateX(0%)';
    // 跳转到第一项
    requestAnimationFrame(() => {
      transform.value = '';
      transition.value = 'transform 0.5s ease-in-out';
    })
    currentIndex.value = 0
  }else {
    currentIndex.value++
  }
}
</script>

<style scoped>

.card-carousel {
  position: relative;
  display: flex;
  width: 800px;
  height: 50%;
  border: 2px solid #cf1919;
  align-self: center;
}
.image-container-mother {
  position: relative;
  display: flex;
  border-radius: 12px;
  overflow: hidden;
}
.image-container {
  width: 100%;
  height: 100%;
  display: inline-block;
  flex: none;
}
.image{
  width: 100%;
  height: 100%;
  object-fit: cover;

}
.indicator {
  padding: 0;
  margin: 0;
  position: absolute;
  bottom: 4px;
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 20px;
}
.indicator-item {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  cursor: pointer;
}
.card-item {
  width: 100px;
  flex:0 0 auto;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.8);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}
.prev { left: 20px; border: 1px solid #5c11be; }
.next { right: 20px; border: 1px solid #b61472;}



</style>