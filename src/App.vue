<template>
  <div id="app">
    <div id="menu">
      <side-menu />
    </div>
    <div id="desktop" class="flex flex-row">
      <plant-search />
      <grow />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import SideMenu from "@/components/SideMenu.vue"
import PlantSearch from "@/views/PlantSearch.vue"
import Grow from "@/views/Grow.vue"

@Component({
  components: {
    PlantSearch,
    SideMenu,
    Grow
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: grid;
  grid-template-areas: "menu desktop";
  grid-template-columns: 3rem 1fr;
}

#menu {
  grid-area: menu;
  @apply w-11;
}

#desktop {
  grid-area: desktop;
}
</style>
