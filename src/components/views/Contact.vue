<template>
    <a-layout class="contact-layout-wrapper">
        <a-layout-sider class="contact-sider">
            <div class="contact-sider-add-contact-btn-wrapper">
                <a-button class="contact-sider-add-contact-btn" @click="makeSubWindow">
                    <template #icon>
                        <svg
                            width="20" height="20"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"><g fill="none"><path d="M9 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM6 6a3 3 0 1 1 6 0a3 3 0 0 1-6 0zm-1.991 5A2.001 2.001 0 0 0 2 13c0 1.691.833 2.966 2.135 3.797C5.417 17.614 7.145 18 9 18c.41 0 .816-.019 1.21-.057a5.501 5.501 0 0 1-.618-.958C9.398 16.995 9.2 17 9 17c-1.735 0-3.257-.364-4.327-1.047C3.623 15.283 3 14.31 3 13c0-.553.448-1 1.009-1h5.59c.184-.358.405-.693.658-1H4.01zM14.5 19a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9zm0-7a.5.5 0 0 1 .5.5V14h1.5a.5.5 0 0 1 0 1H15v1.5a.5.5 0 0 1-1 0V15h-1.5a.5.5 0 0 1 0-1H14v-1.5a.5.5 0 0 1 .5-.5z" fill="currentColor"></path></g></svg>
                    </template>
                        <span>创建新角色</span>
                </a-button>
            </div>
            <ContactList :contactList="simpleContactList"></ContactList>
        </a-layout-sider>
        <a-layout-content class="contact-content" :style="{
            backgroundImage:  backgroundImageUrl ? `url(${backgroundImageUrl})`: 'none',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',  // 固定背景图片
            backgroundPosition: 'center',   // 确保居中定位
            overflow: 'hidden',
            position: 'relative',
            //zIndex: 0,
        }">
            <RoleInfo v-if="!toolFuns.isEmptyObject(selectedContactInfo)" :roleInfo="selectedContactInfo">
            </RoleInfo>
            <svg v-else  viewBox="0 0 1200 600"
                :style="{
                    position: 'absolute',
                    zIndex: 1,
                    width: '50%',
                    height: 'auto',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.1,
            }"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <path fill-rule="evenodd"  fill="var(--olivine-450)"
                d="M406.926,-0.000 C479.887,-1.246 459.687,103.601 446.232,153.811 C430.467,212.641 414.710,268.166 393.825,321.239 C385.763,339.896 377.699,358.559 369.637,377.216 C366.446,383.603 363.253,389.992 360.062,396.379 C363.925,407.305 367.789,418.233 371.652,429.159 C382.921,457.236 397.119,491.862 423.556,503.291 C461.260,519.591 490.065,462.932 501.662,440.253 C512.760,418.552 522.894,396.402 532.905,372.677 C537.272,361.920 541.640,351.159 546.007,340.402 C546.175,320.232 546.343,300.056 546.511,279.886 C552.129,227.679 545.710,178.036 555.077,130.614 C555.749,121.369 556.421,112.122 557.093,102.877 C561.258,79.404 562.930,53.775 568.179,31.771 C570.821,20.693 570.049,7.370 578.761,2.521 C581.442,1.030 586.696,0.436 590.351,1.513 C607.218,6.480 596.862,42.660 593.375,59.003 C588.643,81.176 588.908,104.934 584.808,129.101 C582.000,145.654 579.997,162.006 580.777,178.522 C581.051,184.327 579.389,198.328 578.257,203.737 C577.585,232.311 576.913,260.894 576.241,289.468 C576.577,289.300 576.913,289.132 577.249,288.964 C579.501,281.994 585.055,275.996 588.839,270.304 C611.282,236.551 635.798,205.987 676.016,190.121 C701.062,180.241 735.689,184.765 749.084,202.728 C791.141,259.131 724.366,322.606 687.103,344.941 C677.212,350.869 659.969,355.186 651.325,361.583 C651.493,361.919 651.661,362.255 651.829,362.591 C683.513,376.507 709.425,419.032 733.463,442.775 C742.798,451.996 761.116,460.229 776.295,450.844 C793.104,440.451 804.768,418.748 813.081,399.909 C832.930,354.928 848.857,305.594 864.480,254.671 C869.246,239.137 875.540,181.158 898.243,189.112 C902.749,190.691 907.606,194.854 908.825,199.703 C910.823,207.653 903.124,243.341 901.266,253.158 C891.449,305.040 884.474,403.451 912.352,439.245 C923.179,453.146 942.206,449.697 953.169,438.740 C975.671,416.253 990.984,383.623 1003.561,351.497 C1007.239,342.102 1011.731,322.469 1027.748,327.290 C1030.900,328.239 1034.103,329.491 1035.811,331.829 C1043.930,342.945 1027.227,373.143 1022.205,382.763 C1005.532,414.704 992.214,448.057 963.247,467.485 C953.872,473.774 939.843,481.814 922.430,478.076 C884.266,469.882 874.000,435.866 866.496,396.884 C865.488,383.605 864.480,370.322 863.473,357.044 C863.473,357.380 863.473,357.716 863.473,358.053 C859.778,367.633 856.081,377.217 852.386,386.798 C844.502,405.402 835.402,423.627 825.175,440.253 C806.147,471.186 767.311,500.845 724.896,474.546 C709.416,464.947 697.638,448.424 686.599,434.202 C660.495,400.571 629.370,375.065 576.745,373.686 C576.577,374.022 576.409,374.358 576.241,374.694 C578.761,409.992 581.281,445.300 583.800,480.597 C586.329,496.348 587.550,514.286 573.722,517.411 C558.178,520.924 557.972,506.629 556.085,495.222 C553.734,467.488 551.382,439.746 549.030,412.013 C548.694,412.181 548.358,412.349 548.022,412.517 C545.252,426.222 534.705,440.860 528.370,452.357 C510.019,485.657 491.139,524.763 449.759,534.557 C392.497,548.111 350.733,473.230 340.914,433.193 C340.410,433.529 339.906,433.866 339.402,434.202 C336.422,443.727 329.727,452.035 324.788,459.921 C309.817,483.828 294.262,510.261 268.350,522.958 C241.002,536.359 213.587,529.729 198.306,509.342 C182.680,488.497 178.874,459.292 173.110,428.150 C171.935,414.199 170.759,400.244 169.583,386.293 C169.583,386.629 169.583,386.966 169.583,387.302 C164.208,400.580 158.832,413.863 153.458,427.142 C138.638,462.315 117.499,503.060 88.453,524.471 C65.067,541.710 32.983,542.660 16.393,517.915 C1.361,495.494 -3.727,448.825 2.787,412.013 C14.652,344.965 31.896,278.524 76.359,244.081 C108.507,219.177 154.794,214.136 183.692,246.602 C187.799,243.967 193.108,242.033 199.314,244.081 C213.835,248.873 210.640,267.090 207.376,282.912 C196.532,335.485 195.238,410.127 209.392,460.425 C215.827,483.291 225.195,512.570 255.752,496.735 C279.972,484.183 301.438,444.136 314.206,419.073 C318.909,410.164 323.613,401.253 328.316,392.345 C325.964,382.932 323.612,373.517 321.261,364.104 C316.228,342.606 316.987,319.019 313.198,295.519 C313.198,281.737 313.198,267.950 313.198,254.167 C316.628,231.442 314.703,205.152 318.741,183.565 C330.889,118.634 337.997,41.281 382.738,10.086 C390.000,5.023 398.142,4.058 406.926,-0.000 ZM433.634,7.060 L434.642,7.564 L433.634,7.060 ZM410.454,28.745 C404.323,32.167 398.178,33.787 393.825,38.831 C356.913,81.593 347.215,171.564 342.425,246.602 C340.685,273.859 341.698,301.116 345.953,324.769 C347.128,332.501 348.304,340.235 349.480,347.967 C349.648,347.630 349.816,347.294 349.984,346.958 C362.988,328.104 370.390,297.978 378.707,274.843 C396.593,225.095 412.012,172.478 424.059,115.989 C428.772,93.894 439.700,29.483 410.454,28.745 ZM902.274,94.304 C942.601,92.955 930.217,149.489 897.235,142.717 C879.543,139.084 874.180,116.230 886.653,102.877 C890.816,98.420 896.372,97.197 902.274,94.304 ZM703.732,213.823 C691.687,218.536 681.254,218.609 671.481,224.413 C638.717,243.872 619.760,275.573 600.429,308.631 C594.356,319.018 586.453,330.720 582.792,342.924 C583.128,342.924 583.464,342.924 583.800,342.924 C593.155,345.810 616.210,340.347 625.625,337.881 C666.641,327.137 702.972,305.214 722.377,272.826 C735.030,251.706 739.115,213.693 703.732,213.823 ZM129.774,252.150 C121.588,255.384 113.707,254.316 107.097,258.201 C59.987,285.894 43.740,350.364 32.014,413.525 C26.848,441.354 29.089,499.104 48.140,507.325 C66.391,515.201 88.440,482.383 95.004,472.528 C122.193,431.705 139.246,383.679 156.985,332.838 C159.974,324.270 173.903,285.662 172.606,278.878 C165.903,263.916 148.481,255.555 129.774,252.150 ZM759.162,482.110 C759.330,482.446 759.498,482.783 759.666,483.119 C759.834,482.783 760.002,482.446 760.170,482.110 C759.834,482.110 759.498,482.110 759.162,482.110 Z"/>
            </svg>
        </a-layout-content>
    </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import ContactList from '../ContactList.vue'
import RoleInfo from '../RoleInfo.vue'
import { useChatStore } from '../../stores'
import { storeToRefs } from 'pinia'
import { toolFuns } from '../../shared/toolFuns'
import { sizes, subWindowEvents } from '../../shared/consts'


const exeDir = import.meta.env.VITE_EXE_DIR
const defaultBackUrl = exeDir + 'config/post/defaultPost/defaultBg.png'
const defaultPostUrl = exeDir + 'config/post/defaultPost/defaultPost.png'
const backgroundImageUrl = ref(null)   // 背景图片地址
const lastBackgroundUrl = ref(null) // 真正渲染的背景图（避免白屏闪烁）
const test = ref('./config/post/defaultPost/defaultPost.png')
// 状态管理 阅读状态提取出简要联系人列表
const store = useChatStore()
const { contactList, selectedContact } = storeToRefs(store)  // 解构出状态 state
const simpleContactList = computed(() => {
    return contactList.value.map(item => {
        return {id: item.user_id, name: item.user_name, avatarUrl: item.avatar_url}
    })
})
const selectedContactInfo = computed(() => {
    if (selectedContact.value) {
        const selectedPostUrl = selectedContact.value.post_url || defaultPostUrl  //defaultPostUrl
        backgroundImageUrl.value = selectedPostUrl  // 记录当前加载图
        return {
            id: selectedContact.value.user_id,
            name: selectedContact.value.user_name,
            voiceEngine: selectedContact.value.voice_engine,
            postUrl: selectedContact.value.post_url || defaultPostUrl,
            gender: selectedContact.value.gender,
            area: selectedContact.value.area,
            presupposition: selectedContact.value.presupposition,  
        }
    }
    else {
        backgroundImageUrl.value = null
        return {}
    }
})

// 打开创建角色子窗口
const makeSubWindow = () => {
    window.ipcRenderer.send(subWindowEvents.MAKE_ROLE, {
        options: {
            width:sizes.SUB_WINDOW_WIDTH,
            height:sizes.SUB_WINDOW_HEIGHT,
            resizable: false,
            routerPath: '/sub/create-role'
        }, 
    })
}

</script>

<style scoped>
.contact-layout-wrapper {
    height: 100%;
}
/* 改变slider默认背景色*/
.contact-layout-wrapper :deep(.arco-layout-sider) {
    background: none;
    box-shadow: none;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
}

/*背景过渡 */
.contact-content {
    transition: background-image 1s ease;
    background-color: var(--color-ivory-shoadow);
}

/* 创建毛玻璃效果层 */
.contact-content::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /*filter: blur(10px);*/
    backdrop-filter: blur(100px);
    z-index: 0;
}
/* 让子元素显示在毛玻璃上面 */
/* 再设置 .contact-content > * {position: relative; z-index: 1;} 就能让子组件的背景色不被虚化 */
/*非常神奇, 可以让RoleInfo的背景被虚化, 但子元素正常显示 */
.contact-content  * {
    z-index: 1;
}
/* 添加新角色的按钮 */
.contact-sider-add-contact-btn-wrapper {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: white;
}
.contact-sider-add-contact-btn {
    width: 80%;
    border-radius: 10px;
    font-weight: bold;
    color: var(--olivine-450);
    align-self: center;
    background-color: var(--color-neutral-3);
    
}
.contact-sider-add-contact-btn:hover {
    color: var(--olivine-450);
    background-color: var(--color-neutral-4);
}

</style>