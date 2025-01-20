import { createApp } from 'vue'
import App from './views/App.vue'

import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap"

import Router from "./router"

createApp(App).use(Router).mount('#app')