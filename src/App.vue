<template>
  <div id="app" class="flex flex-row">
    <side-menu />
    <plant-search />
    <grow />
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
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
