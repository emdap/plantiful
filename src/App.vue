<template>
  <div id="app">
    <div id="menu">
      <side-menu />
    </div>
    <div id="main-grid">
      <!-- <widget-controller /> -->
      <container />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import SideMenu from "@/views/SideMenu.vue"
import Container from "@/views/GridController.vue"

@Component({
  components: {
    Container,
    SideMenu,
  },
})
export default class App extends Vue {}
</script>

<style lang="css">
body {
  @apply transition-colors bg-gray-50 dark:bg-gray-800;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: grid;
  grid-template-areas: "menu main-grid";

  /* adding padding instead of expanding/empty cols leads to weird effects when resizing containers */
  grid-template-columns: 3.25rem 1fr 0.25rem;

  @apply text-center overflow-hidden;
}

#menu {
  grid-area: menu;
  z-index: 150;

  @apply h-screen;
}

#main-grid {
  grid-area: main-grid;
  overflow: auto;

  @apply h-screen;
}
</style>
