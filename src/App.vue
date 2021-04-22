<template>
  <div id="app">
    <div id="menu">
      <side-menu />
    </div>
    <div id="container">
      <!-- <widget-controller /> -->
      <container />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import SideMenu from "@/views/SideMenu.vue"
import Container from "@/views/Container.vue"

@Component({
  components: {
    Container,
    SideMenu
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: grid;
  grid-template-areas: "menu container";
  grid-template-columns: 3rem 1fr;
  overflow: hidden;

  @apply bg-gray-50 dark:bg-gray-800;
}

#menu {
  grid-area: menu;
  z-index: 150;

  @apply h-screen;
}

#container {
  grid-area: container;
  overflow: auto;

  @apply h-screen;
}
</style>
