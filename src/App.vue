<template>
  <div id="app">
    <div id="menu">
      <side-menu />
    </div>
    <div id="container">
      <widget-controller />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import SideMenu from "@/views/SideMenu.vue"
import WidgetController from "@/views/WidgetController.vue"

@Component({
  components: {
    WidgetController,
    SideMenu
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
body {
  @apply bg-gray-50;
}

#app {
  // font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: grid;
  grid-template-areas: "menu container";
  grid-template-columns: 3rem 1fr;
  overflow: hidden;
}

#menu {
  grid-area: menu;
  z-index: 150;
  @apply h-screen;
}

#container {
  grid-area: container;
  overflow: auto;
  @apply pl-2;
  @apply h-screen;
}
</style>
