import Vue from "vue"
import App from "./App.vue"
import store from "./store"
import Toasted from "vue-toasted"
import "@/index.css"

const toastedOptions = {
  position: "bottom-right",
  duration: "3000",
  keepOnHover: true,
  containerClass: "toasted-container-custom",
  className: "toasted-custom"
}
Vue.use(Toasted, toastedOptions)

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount("#app")
