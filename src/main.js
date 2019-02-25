import Vue from 'vue'
import App from './App'
import router from './router'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import ElementUI from 'element-ui'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
Vue.use(ZkTable)
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(
  function(config) {
    NProgress.start()
    var token = window.sessionStorage.getItem('token')
    config.headers.Authorization = token
    return config
  },
  function(error) {
    return Promise.reject(error)
  }
)
axios.interceptors.response.use(
  function(response) {
    NProgress.done()
    return response
  },
  function(error) {
    return Promise.reject(error)
  }
)

Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.$http = axios

// 过滤器
Vue.filter('dateFormat', function(originVal) {
  var tm = new Date(originVal)
  var yyyy = tm.getFullYear()
  var mm = (tm.getMonth() + 1 + '').padStart(2, 0)
  var dd = (tm.getDate() + '').padStart(2, 0)
  var hh = (tm.getHours() + '').padStart(2, 0)
  var ii = (tm.getMinutes() + '').padStart(2, 0)
  var ss = (tm.getSeconds() + '').padStart(2, 0)
  return `${yyyy}-${mm}-${dd} ${hh}:${ii}:${ss}`
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: (h) => h(App)
})
