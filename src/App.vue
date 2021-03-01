<template>
  <div id="app">
    <span v-if="loading">
      Loading ...
    </span>
    <button v-if="!plantList.length" @click="getPlantPage(1)">
      Show plants
    </button>
    <template v-else>
      <button v-if="currentPage != 1" @click="getPlantPage(currentPage - 1)">
        Previous plants
      </button>
      <button v-if="hasNextPage" @click="getPlantPage(currentPage + 1)">
        More plants
      </button>
      <div style="float: left">
        <div
          v-for="(plant, index) in plantList"
          :key="`plant ${index}`"
          @click="selectPlant(plant.id)"
        >
          <h3>{{ plant.common_name }}</h3>
          <h5>{{ plant.scientific_name }}</h5>
        </div>
      </div>
      <div style="float: right">
        <span v-if="!showActivePlant">
          Click on a plant name to see more information.
        </span>
        <div v-else-if="!loading">
          <h1>{{ activePlant.common_name }}</h1>
          <h3>{{ activePlant.scientific_name }}</h3>
          <img :src="activePlant.image_url" style="max-width: 500px" />
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
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { listPlants, getPlant } from "@/services/plants"

@Component({})
export default class App extends Vue {
  public currentPage = 1
  public hasNextPage = true
  public loading = false
  public showActivePlant = false
  // TODO: create interface for plant object/response
  public plantList = []
  public cachedPlantList = {} as { [key: number]: any }
  public activePlant = {}

  public getPlantPage(getPage: number) {
    if (this.plantList.length) {
      // cache current page
      this.cachedPlantList[this.currentPage] = this.plantList
    }
    console.log(this.currentPage, this.cachedPlantList)
    if (this.cachedPlantList[getPage]) {
      this.plantList = this.cachedPlantList[getPage]
      this.currentPage = getPage
    } else {
      this.loading = true
      // TODO: response type
      listPlants(getPage)
        .then((response: any) => {
          this.plantList = response.data
          this.hasNextPage = response.links.self != response.links.last
          this.currentPage = getPage
        })
        .catch((error: Error) => {
          console.error(error)
        })
        .finally(() => (this.loading = false))
    }
  }

  public selectPlant(id: number) {
    this.loading = true
    // TODO: response type
    getPlant(id).then((response: any) => {
      this.activePlant = response.data
      this.loading = false
      this.showActivePlant = true
    })
  }
}
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
