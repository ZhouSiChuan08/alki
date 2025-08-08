<template>
    <img
      v-if="outputSrc"
      :src="outputSrc"
      :alt="alt"
      :style="{
        width: props.width + 'px',
        height: props.height + 'px',
        objectFit: props.objectFit,
      }"
      draggable="false"
      @dragstart.prevent
    />
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  // 接收 props
  const props = defineProps({
    src: { type: String, required: true },             // 原图 URL
    width: { type: Number, required: true },           // 目标图片容器宽度（px）
    height: { type: Number, required: true },          // 目标图片容器高度（px）
    alt: { type: String, default: '' },                // alt 文本
    format: { type: String, default: 'image/jpeg' },   // 输出格式
    quality: { type: Number, default: 0.92 },          // 压缩质量 (0~1) 最佳 0.92
    objectFit: { type: String, default: 'cover' },     // 图像适应方式
    scaleRate: { type: Number, default: 1 },           // 图片缩放比例 决定了图片清晰度 0.5最佳
  })                                                   // 一般用于压缩分辨过大图片 消除高分辨率图片在低尺寸容器中的显示锯齿
  
  // 输出结果
  const outputSrc = ref(null)
  
  const compressImage = (src, format, quality, scaleRate) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
  
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const imgWidth = img.width * scaleRate
      const imgHeight = img.height * scaleRate
      canvas.width = imgWidth 
      canvas.height = imgHeight 
  
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
  
      const finalSrc = format === 'image/png'
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL(format, quality)  // 转base64
  
      outputSrc.value = finalSrc
    }
  
    img.onerror = () => {
      console.error('In CompressImage.vue: 图片加载失败:', src)
      outputSrc.value = null
    }
  
    img.src = src
  }
  
  // 自动监听 src 变化
  watch(
    () => props.src,
    (newVal) => {
      if (newVal) {
        compressImage(newVal, props.format, props.quality, props.scaleRate)
      } else {
        outputSrc.value = null
      }
    },
    { immediate: true }  // 在侦听器刚被注册时，就立即执行一次回调函数（即使被监听的值没有变化）
  )
</script>
  