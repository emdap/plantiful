<template>
  <div id="app" class="flex flex-row h-screen">
    <plant-search />
    <!-- </div> -->
    <Widget initWidth="59%">
      <div
        id="active-plant"
        v-if="plantList.length"
        class="p-4 flex-grow overflow-auto"
      >
        <span v-if="!activePlant">
          {{ activePlantMessage }}
        </span>
        <div v-else-if="!loadingPlant" class="flex-col">
          <h1>{{ activePlant.common_name }}</h1>
          <h3>{{ activePlant.scientific_name }}</h3>
          <img :src="activePlant.image_url" class="max-h-full" />
          <ul>
            <li>
              <strong> Flower colors: </strong>
              <span
                v-for="(color, index) in activePlant.main_species.flower.color"
                :key="`flower ${index}`"
              >
                <span v-if="index != 0">, </span>
                <span :style="`color: ${color}`"> {{ color }} </span>
              </span>
            </li>
            <li>
              <strong> Foliage texture: </strong>
              <span> {{ activePlant.main_species.foliage.texture }} </span>
            </li>
            <li>
              <strong> Foliage colors: </strong>
              <span
                v-for="(color, index) in activePlant.main_species.foliage.color"
                :key="`foliage ${index}`"
              >
                <span v-if="index != 0">, </span>
                <span :style="`color: ${color}`"> {{ color }} </span>
              </span>
            </li>
            <li>
              <strong> Average height: </strong>
              <span>
                {{ activePlant.main_species.specifications.average_height }} cm
              </span>
            </li>
            <li>
              <strong> Shape and orientation: </strong>
              <span>
                {{
                  activePlant.main_species.specifications.shape_and_orientation
                }}
              </span>
            </li>
            <li>
              <strong>
                Growth spread:
              </strong>
              <span> {{ activePlant.main_species.growth.spread }} </span>
            </li>
          </ul>
          <button class="btn-primary">
            Grow
          </button>
        </div>
        <div v-else>
          Loading ...
        </div>
      </div>
    </Widget>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import PlantSearch from "./views/PlantSearch.vue"

@Component({
  components: {
    PlantSearch
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
