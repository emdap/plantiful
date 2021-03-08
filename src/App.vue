<template>
  <div id="app" class="flex flex-row h-screen">
    <Widget initHeight="full" initWidth="41%">
      <div id="search-bar">
        <input
          id="search-input"
          class="p-2 w-5/12 text-center"
          type="text"
          v-model="searchQuery"
          placeholder="Enter search terms (optional)"
          @keyup.enter="plantSearch(1)"
        />
        <button
          :disabled="!searchUpdated"
          @click="plantSearch(1)"
          class="btn-primary"
        >
          Search plants
        </button>
      </div>
      <template v-if="plantList.length || loadingPlantList">
        <div
          id="page-nav"
          :class="loadingPlantList ? 'text-gray-200' : 'text-green-800'"
        >
          <h3>Page {{ garden.currentPage }} of {{ garden.lastPage }}</h3>
          <span class="text-sm">
            <button
              :disabled="disablePageButton('first')"
              @click="iteratePage('prev')"
            >
              First page
            </button>
            <button
              :disabled="disablePageButton('first')"
              @click="iteratePage('prev')"
            >
              Previous page
            </button>
            <button
              :disabled="disablePageButton('next')"
              @click="iteratePage('next')"
            >
              Next page
            </button>
            <button
              :disabled="disablePageButton('next')"
              @click="iteratePage('last')"
            >
              Last page
            </button>
          </span>
        </div>
        <span v-if="loadingPlantList">
          Loading ...
        </span>
        <div v-else id="search-results" class="flex-grow overflow-auto">
          <div
            v-for="(plant, index) in plantList"
            :key="`plant ${index}`"
            @click="selectPlant(plant.id)"
            class="cursor-pointer hover:bg-green-200"
          >
            <h3>{{ plant.common_name }}</h3>
            <h5>{{ plant.scientific_name }}</h5>
          </div>
        </div>
      </template>
    </Widget>
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
import { Watch } from "vue-property-decorator"
import {
  FilterParams,
  FilterType,
  Filter,
  PageLinks,
  PageLinkKey,
  PlantListResponse,
  Plant,
  PlantResponse,
  PlantSnippet,
  SearchPlantsPayload
} from "@/store/interfaces"
import { listPlants, getPlant, getLink, searchPlants } from "@/services/plants"
import garden from "@/store/modules/garden"
import Widget from "@/components/Widget.vue"
import Search from "./components/Search.vue"

@Component({
  components: {
    Widget
  }
})
export default class App extends Vue {
  public searchUpdated = true
  // TODO: extract messages to fixture, add loadingPlantList messages
  public activePlantMessage = "Click on a plant name to see more information."

  public filterParams = {} as FilterParams
  public searchQuery = ""
  public garden = garden

  public mounted() {
    // TODO: allow changeable filter
    this.addFilterParam("flower_color", "null", false)
    this.addFilterParam("foliage_color", "null", false)
  }

  public get plantList() {
    return garden.plantList
  }

  public get loadingPlantList() {
    return garden.loading.plantList
  }

  public get loadingPlant() {
    return garden.loading.plant
  }

  public get activePlant() {
    return garden.activePlant
  }

  public disablePageButton(page: "prev" | "next"): boolean {
    if (page == "prev" && garden.currentPage == 1) {
      return true
    }
    if (page == "next" && garden.lastPage == garden.currentPage) {
      return true
    }
    return false
  }

  // used on initial search, or when jumping to non-consecutive page
  public plantSearch(page: number) {
    if (!this.searchUpdated && page == garden.currentPage) {
      return
    }

    this.searchUpdated = false
    // page not cached, make API call
    const payload: SearchPlantsPayload = {
      page,
      filter: this.formatFilterParams(),
      query: this.searchQuery
    }

    const newSearch = true // set this to false if page jumping (need to implement)
    garden.getPlantList(payload, newSearch)
  }

  public iteratePage(link: PageLinkKey) {
    // Trefle provides direct links to specific pages, use that when possible instead of re-constructing query
    let page = garden.currentPage
    switch (link) {
      case "prev":
        page--
        break
      case "next":
        page++
        break
      case "first":
        page = 1
        break
      case "last":
        page = garden.lastPage
        break
    }
    const apiLink = garden.pageLinks[link]
    if (apiLink) {
      garden.getPageByLink({ page, apiLink })
    } else {
      // TODO: handle error
      console.error("no link for", link)
    }
  }

  public selectPlant(id: number) {
    garden.getOnePlant(id)
  }

  public addFilterParam(apiKey: string, value: string, include: boolean) {
    const filterType = include ? "filter" : "filter_not"
    let addToFilter = this.filterParams[filterType]
    if (!addToFilter) {
      addToFilter = this.filterParams[filterType] = {}
    }
    if (!addToFilter[apiKey]) {
      addToFilter[apiKey] = []
    }
    addToFilter[apiKey].push(value.toString())
  }

  public formatFilterParams(): string {
    let filterQuery = ""
    for (const filterType of Object.keys(this.filterParams)) {
      const filter = this.filterParams[filterType as FilterType] as Filter
      for (const filterKey of Object.keys(filter)) {
        filterQuery = `${filterQuery}&${filterType}[${filterKey}]=${filter[
          filterKey
        ].join()}`
      }
    }
    return filterQuery
  }

  @Watch("searchQuery")
  onSearchChanged() {
    this.searchUpdated = true
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
