<template>
    <section>
        <!-- 选择文件的按钮 -->
        <a-button class="select-picture-btn" shape="circle" @click="uploadInput.click()">
            <IconCamera :strokeLinecap="`round`" :strokeLinejoin="`round`" />
            <input class="img-input"
            ref="uploadInput"
            type="file"
            accept="image/jpg, image/jpeg, image/png, image/gif"
            @change="selectFile"
            />
        </a-button>
    </section>
    <!-- 裁剪图片的弹窗 -->
    <a-modal v-if="isShowModal" v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
        <template #title>裁剪图片</template>
        <template #footer>
            <a-button type="secondary" @click="handleCancel; isShowModal = false">取消</a-button>
            <a-button v-if="props.isUseResetBtn" type="primary" @click="reset">重置</a-button>
            <a-button type="primary" @click="getResult(), handleOk()">确定</a-button>
        </template>
        <div class="modal-wrap">
            <!-- 裁剪工作区 -->
            <div class="modal-content">
                <VuePictureCropper
                    :boxStyle="{
                        width: '400px',
                        height: '400px',
                        backgroundColor: '#f8f8f8',
                        margin: 'auto',
                    }"
                    :img="pic"
                    :options="{...DEFAULT_OPTIONS, ...props.options}"
                    :presetMode="props.presetMode"
                    @ready="ready"
                />
            </div>
        </div>
    </a-modal>
    <img v-if="imgSrc" :src="imgSrc"
        :style="{
            width: '300px',
            height: '300px',
            objectFit: 'contain',
            display: props.isPreview ? 'block' : 'none',
        }"
    />
</template>
<script setup>
import { ref, reactive } from 'vue'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import { IconCamera } from '@arco-design/web-vue/es/icon'
import { saveEvents } from '../shared/consts'

const isShowModal = ref(false)   // 弹窗是否显示 多裁剪框时，其他弹窗消失，当前弹窗的裁剪蒙版才能生效
const imgSrc = ref(null)         // 裁剪后图片源
const pic = ref('')              // 裁剪图片源    
const uploadInput = ref(null)    // 选择文件的input元素
const result = reactive({        // 裁剪结果 和ref不同，reactive可以直接访问和修改属性，不加value
    dataURL: '',
    blobURL: '',
})
const visible = ref(false)      // 弹窗是否可见
let fileName = ''               // 选择的文件名
const DEFAULT_OPTIONS = {       // 默认参数
  viewMode: 1,                  // 可以决定裁剪框的活动范围，可选 0 / 1 / 2 / 3 ，建议选 1 （裁剪框只能在图片区域内活动）
  dragMode: 'crop',             // crop: 可用鼠标新建裁剪框  move: 只能移动裁剪框
  cropBoxResizable: true        // 裁剪框是否可调节大小
  //aspectRatio: 1,
}
const props = defineProps({
    isSendImg: {                // 是否发送图片到主进程
        type: Boolean,
        default: false
    },
    imgSaveFolder: {            // 图片保存路径
        type: String,
        default: ''
    },
    isPreview: {                // 是否显示预览区
        type: Boolean,
        default: false
    },
    options: {                  // 图片裁剪组件参数
        type: Object,
        default: () => ({})     // 默认空对象
    },
    presetMode: {               // 预设模式
        type: Object,
        default: () => ({
            //mode: 'round' | 'fixedSize',
            //width: 300, 要裁剪的尺寸
            //height: 300,
        })
    },
    isUseResetBtn: {            // 是否显示重置按钮 固定尺寸裁剪时使用 假如设置了裁剪尺寸为100*100，重置按钮会让裁剪区域恢复到默认尺寸200*200
        type: Boolean,
        default: true
    }
})
const emit = defineEmits(['imgNameEvent'])
const modalEnable = () => {
    visible.value = true
}
const handleOk = () => {
    visible.value = false
}
const handleCancel = () => {
    visible.value = false
}
// 向主进程发送图片数据
const sendImg = async (folderName, fileName, buffer) => {
    if(props.isSendImg) {
        const isSaved =  await window.ipcRenderer.invoke(saveEvents.IMAGE, {
            folderName: folderName,
            fileName: fileName,
            arrayBuffer: buffer
        })
        return isSaved
    }
}
// 选择图片文件
const selectFile = (event) => {
    modalEnable()                          // 显示弹窗
    // Get selected files
    const { files } = event.target
    if (!files || !files.length) return
    const file = files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)             // 转换为dataURL格式并传给裁剪器
    reader.onload = () => {                // 回调函数,在FileReader 对象成功读取文件并完成加载后触发
        pic.value = reader.result          // 裁剪图片源 
        isShowModal.value = true           // 显示模态窗
        if (!uploadInput.value) return     // 一些清理操作
        fileName  = file.name              // 获取文件名 pic1.jpg
        uploadInput.value.value = ''       // 第一个value表示input的ref引用，第二个value表示input元素的value属性，即用户选择的文件路径
    }                                      // 把用户选择的路径清空 以便下次选择
}
// 获取裁剪结果
const getResult = async () => {
    if (!cropper) return
    const base64 = cropper.getDataURL()
    const blob = await cropper.getBlob()
    if (!blob) return

    const file = await cropper.getFile({
    fileName: fileName,
    })

    console.log("In CropImage.vue: ",{ base64, blob, file })
    result.dataURL = base64
    result.blobURL = URL.createObjectURL(blob)
    imgSrc.value = result.dataURL               // 赋值到预览区
    const buffer = await file.arrayBuffer()     // 把文件对象转为ArrayBuffer对象
    // crop会额外添加后缀,这里去掉,保持原始文件名
    const imgName = file.name.split('.')[0]+'.'+ file.name.split('.')[1]
    // 发送图片数据到主进程
    if(await sendImg(props.imgSaveFolder, imgName, buffer)) {              
        emit('imgNameEvent', imgName)           // 触发事件，向父组件传回图片名
    }
    isShowModal.value = false                   // 关闭弹窗 不会产生key冲突
}
// 重置裁剪盒子
const reset = () => {
    if (!cropper) return
    cropper.reset()
}
// 图片裁剪组件准备就绪
const ready = () => {
    console.log('cropper is ready')
}

</script>
  
<style scoped>
.img-input {
    display: none;
}
.select-picture-btn {
    outline: none;
    background: var(--olivine-325);
    transition: all 0.2s ease;
    color: black;
    cursor: pointer;
    font-size: 18px;
    width: 40px;
    height: 40px;
}
.select-picture-btn:hover {
  color: white;
  background: var(--olivine-325);
}

</style>