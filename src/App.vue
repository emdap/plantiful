<template>
  <div id="app" class="grid text-center overflow-hidden">
    <side-menu />
    <grid-controller />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import SideMenu from "@/views/SideMenu.vue"
import GridController from "@/views/GridController.vue"

@Component({
  components: {
    GridController,
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

  /* adding padding instead of expanding/empty cols leads to weird effects when resizing containers */
  grid-template-columns: 3.25rem 1fr 0.25rem;
  grid-template-areas: "side-menu main-grid";
}
</style>
