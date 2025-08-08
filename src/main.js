import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router' // 自动识别 router/index.js

createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
