<template>
    <div class="model-setting">
        <!-- 阻止回车提交表单 @keydown.enter.prevent -->
        <a-form ref="formRef" class="model-setting-form" :model="form"  @keydown.enter.prevent @submit="handleSubmit" @submit-success="isValidateSuccess = true">
            <a-form-item class="model-setting-select-wrapper" field="ModelSelected" tooltip="使用何种模型对话" label="选择模型"
                :rules="[{ validator: (_, cb) => {
                    !form.ModelSelected.trim() && cb('必须选择一种模型')
                }}]">
                <a-select v-model="form.ModelSelected" :placeholder="'请选择模型'" allow-clear >
                    <a-option v-for="model in modelList" :value="model.name">{{ model.name }}</a-option>
                </a-select>
            </a-form-item>
            <a-form-item field="MaxMemoryLength" tooltip="模型最大对话记忆轮数" label="记忆长度"
                :rules="[{ validator: (_, cb) => {
                    const value = form.MaxMemoryLength.trim();
                    if (!value) {
                        return cb('记忆长度不能为空');
                    }
                    if (!/^[1-9]\d*$/.test(value)) {
                        return cb('必须输入正整数');
                    }
                    if (Number(value) > chatConsts.MAX_MEMORY_LENGTH) {  // 最大记忆长度限制
                        return cb(`记忆长度不能超过${chatConsts.MAX_MEMORY_LENGTH}`);  //
                    }
                    cb();  // 验证通过
                }}]">
                <a-input spellcheck="false" v-model="form.MaxMemoryLength" placeholder="请输入数字" :style="{width: '30%'}"/>
            </a-form-item>
            <a-form-item class="asr-select-wrapper" field="SenseVoiceModelSelected" tooltip="语音转文字模型选择" label="ASR模型"
                :rules="[{ validator: (_, cb) => {
                    !form.SenseVoiceModelSelected.trim() && cb('必须选择一种模型')
                }}]">
                <a-select v-model="form.SenseVoiceModelSelected" :placeholder="'请选择模型文件'">
                    <a-option value="model.int8.onnx">int8量化</a-option>
                    <a-option value="model.onnx">原始精度</a-option>
                </a-select>
            </a-form-item>
            <a-form-item class="asr-select-wrapper" field="SenseVoiceLanguage" tooltip="语音转文字语种选择" label="ASR语种"
                :rules="[{ validator: (_, cb) => {
                    !form.SenseVoiceLanguage.trim() && cb('必须选择一种语种')
                }}]">
                <a-select v-model="form.SenseVoiceLanguage" :placeholder="'请选择语种'">
                    <a-option value="auto">自动检测</a-option>
                    <a-option value="zh">中文</a-option>
                    <a-option value="en">英语</a-option>
                    <a-option value="ja">日语</a-option>
                    <a-option value="ko">韩语</a-option>
                    <a-option value="yue">粤语</a-option>
                </a-select>
            </a-form-item>
            <a-form-item field="SenseVoiceNumThreads" tooltip="ASR工作线程数" label="ASR线程数"
                :rules="[{ validator: (_, cb) => {
                    const value = form.SenseVoiceNumThreads.trim();
                    if (!value) {
                        return cb('线程数不能为空');
                    }
                    if (!/^[1-9]\d*$/.test(value)) {
                        return cb('必须输入正整数');
                    }
                    if (Number(value) > chatConsts.MAX_ASR_THREADS) {  // 最大记忆长度限制
                        return cb(`线程数不能超过${chatConsts.MAX_ASR_THREADS}`);  //
                    }
                    cb();  // 验证通过
                }}]">
                <a-input spellcheck="false" v-model="form.SenseVoiceNumThreads" placeholder="请输入正整数" :style="{width: '30%'}"/>
            </a-form-item>
            <a-form-item field="UseMotion" tooltip="为Ai回答添加情绪关键词, 提升语音自然度, 某些模型可能太笨理解不了, 建议关闭" label="使用情绪提示词">
                <a-switch v-model="form.UseMotion" />
            </a-form-item>
            <a-form-item v-if="isDev" field="OtherPrompt" tooltip="开发专用" label="其他提示词"
                :rules="[{ validator: (_, cb) => {
                    // !form.OtherPrompt.trim() && cb('预设不能为空')
                }}]">
                <a-textarea class="otherPrompt-textarea" v-model="form.OtherPrompt" placeholder="请输入预设" spellcheck="false"/>
            </a-form-item>
            <div class="handle-btns" :style="{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                marginBottom: '30px'
                }">
                <a-button type="secondary" shape="round" :style="{
                    marginRight: '20px'
                    }" @click="getLocalModels">恢复
                </a-button>
                <!-- 触发表单提交事件的按钮 按钮必须在form标签内部才能实现点击提交表单 -->
                <a-button type="primary" shape="round" html-type="submit" @click="openDev">保存</a-button>
            </div>
        </a-form>
        
    </div>
    <!-- 以下为测试代码 -->
    <div v-if="false">
        <span>测试表单输入数据 【选择模型】：{{ form.ModelSelected }}</span>
        <br>
    </div>
    <a-modal class="model-setting-modal" v-model:visible="modalVisible" mask hide-cancel :mask-closable="false" 
        :closable = "false" @ok="handleOk" :ok-loading="isOkLoading"
        :ok-button-props = "{shape: 'round'}" 
        :modal-style = "{
            borderRadius: `${sizes.MODAL_BORDERRADIUS}px`,
            width: `${sizes.MODAL_WIDTH}px`,
            height: `${sizes.MODAL_HEIGHT}px`,
        }"
        :body-style = "{
            textAlign: 'center',
        }">
        <template #title>
            <IconInfoCircleFill style="color: var(--olivine-450);" :size="sizes.MODAL_ICON_SIZE"></IconInfoCircleFill>
            <span style="margin-left: 5px;">模型设置</span>
        </template>
        <div style="width: auto; height: 40px; line-height: 40px">
            {{ modalContent }}
        </div>
    </a-modal>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { modelEvents } from '../shared/consts'
import { sizes, chatConsts } from '../shared/consts'
import { IconInfoCircleFill } from '@arco-design/web-vue/es/icon'
import { toolFuns } from '../shared/toolFuns'

// 向后端获取模型列表和当下使用模型
let localModelsAndSettings = null
const modelList = ref([])
// 填充表单
const fillForm = () => {
    if (!toolFuns.isEmptyObject(localModelsAndSettings)) {
        modelList.value = localModelsAndSettings.models.map((model) => ({
            name: model.name,
        }))
        form.ModelSelected = localModelsAndSettings.ModelSelected
        form.MaxMemoryLength = `${localModelsAndSettings.MaxMemoryLength}`
        form.SenseVoiceModelSelected = localModelsAndSettings.SenseVoiceModelSelected
        form.SenseVoiceLanguage = localModelsAndSettings.SenseVoiceLanguage
        form.SenseVoiceNumThreads = `${localModelsAndSettings.SenseVoiceNumThreads}`
        form.UseMotion = localModelsAndSettings.UseMotion
        form.OtherPrompt = localModelsAndSettings.OtherPrompt
        console.log('In ModelSetting.vue, 本地模型列表', modelList.value, '当前使用模型', localModelsAndSettings.ModelSelected)
    }
    else {
        console.log('In ModelSetting.vue, 没有本地模型')
    }
}
const getLocalModels = async () => {
    localModelsAndSettings = await window.ipcRenderer.invoke(modelEvents.GET_LOCAL_MODELS_Setting)
    fillForm()
}

const formRef = ref(null)                    // 表单ref
const form = reactive({                      // 表单数据对象
    ModelSelected: '',
    MaxMemoryLength: '',
    SenseVoiceModelSelected: '',
    SenseVoiceLanguage: '',
    SenseVoiceNumThreads: '',
    UseMotion: false,
    OtherPrompt: '',
})
const isValidateSuccess = ref(false)               // 表单验证是否成功
const handleSubmit = async () => {                 // 表单提交事件回调函数
    if (isValidateSuccess.value === true)          // @submit-success比@submit先触发
    {
        console.log('提交角色配置表单数据', form)
        isValidateSuccess.value = false
        const jsonForm = JSON.stringify({
            ...form,
            MaxMemoryLength: Number(form.MaxMemoryLength), // 转为数字
            SenseVoiceNumThreads: Number(form.SenseVoiceNumThreads), // 转为数字
        })      // 必须将表单对象转为json字符串 因为form是响应对象,无法被克隆传递给主进程
        modalVisible.value = true
        const isSaveSuccess = await window.ipcRenderer.invoke(modelEvents.WRITE_SETTING, jsonForm)
        if (isSaveSuccess) {
            isOkLoading.value = false
            modalContent.value = '设置保存成功'
        }
        else
        {
            isOkLoading.value = false
            modalContent.value = '设置保存失败'
        }
    }
    else
    {
        console.log('模型配置表单验证失败')
    }
}
// 更改配置的创建状态信息弹窗
const modalVisible = ref(false)   // 弹窗是否可见
const isOkLoading = ref(true)     // 弹窗确定按钮是否处于加载状态
const modalContent = ref('保存中,请稍后...')
const handleOk = () => {          // 弹窗确定按钮事件回调函数
    modalVisible.value = false
}

// 输入密码, 进入开发模式, 打开其他提示词更改框
const isDev = ref(false)
const openDev = () => {
    if (form.MaxMemoryLength === 'ZhouSiChuan') {
        isDev.value = true
    }
    else {
        isDev.value = false
    }
}

onMounted(() => {
    getLocalModels()
})

</script>

<style scoped>
/*让外围容器和form宽度保持相同*/
.model-setting,
.model-setting-form {
    width: 700px;  /*调整此项可改变label宽度*/
    --border-radius: 8px;
    --margin-bottom: 20px;
}
.model-setting {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.model-setting-form {
    margin-top: 20px;
}
/*表单内每个整体的行元素 */
.model-setting-form :deep(.arco-row) {
    align-items: center;
    margin-bottom: var(--margin-bottom);
    position: relative;
}
/* 表单内验证提示信息的样式 为避免生成的提示信息拉长输入框高度,影响label文字布局,直接将其脱离文档流定位*/
.model-setting-form :deep(.arco-form-item-message) {
    position: absolute;
    bottom: -20px;
}
/*表单内每个行元素的label */
.model-setting-form :deep(.arco-form-item-label) {
    font-weight: bold;
    font-size: 15px;
}
/*表单内每个行元素的输入框外侧span容器 */
.model-setting-form :deep(.arco-input-wrapper) {
    border: 2px solid var(--blue-gray);
    border-radius: var(--border-radius);
    background: none;
}
/*选中表单内每个行元素的输入框外侧span容器 */
.model-setting-form :deep(.arco-input-wrapper):focus-within {
    border: 2px solid var(--olivine-450);
}
.model-setting-form :deep(.arco-icon-hover.arco-radio-icon-hover)::before {
    width: 20px;
    height: 20px;
}

/*模型选择框*/
.model-setting-select-wrapper :deep(.arco-select-view) {
    background: none;
    border: 2px solid var(--blue-gray);
    border-radius: var(--border-radius);
    width: 80%;
}
.model-setting-select-wrapper :deep(.arco-select-view):focus-within {
    border: 2px solid var(--olivine-450);
}
/* ASR配置选择框 */
.asr-select-wrapper :deep(.arco-select-view) {
    background: none;
    border: 2px solid var(--blue-gray);
    border-radius: var(--border-radius);
    width: 30%;
}
.asr-select-wrapper :deep(.arco-select-view):focus-within {
    border: 2px solid var(--olivine-450);
}

</style>

<style>
/* 提示模态窗footer样式 */
.model-setting-modal .arco-modal-footer {
    text-align: center;
}
</style>