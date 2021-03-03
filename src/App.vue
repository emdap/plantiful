<template>
  <div id="app" class="flex flex-row h-screen">
    <div id="search-window" class="flex h-full w-5/12">
      <div class="flex flex-grow flex-col">
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
        <template v-if="plantList.length || loadingList">
          <div
            id="page-nav"
            :class="loadingList ? 'text-gray-200' : 'text-green-800'"
          >
            <h3>Page {{ currentPage }} of {{ lastPage }}</h3>
            <span class="text-sm">
              <button
                :disabled="currentPage == 1"
                @click="iteratePage('first')"
              >
                First page
              </button>
              <button :disabled="currentPage == 1" @click="iteratePage('prev')">
                Previous page
              </button>
              <button
                :disabled="currentPage == lastPage"
                @click="iteratePage('next')"
              >
                Next page
              </button>
              <button
                :disabled="currentPage == lastPage"
                @click="iteratePage('last')"
              >
                Last page
              </button>
            </span>
          </div>
          <span v-if="loadingList">
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
      </div>
    </div>
    <div
      id="active-plant"
      v-if="plantList.length"
      class="p-4 w-7/12 flex h-full"
    >
      <span v-if="!showActivePlant">
        {{ activePlantMessage }}
      </span>
      <div v-else-if="!loadingPlant" class="flex-col flex-grow">
        <h1>{{ activePlant.common_name }}</h1>
        <h3>{{ activePlant.scientific_name }}</h3>
        <img :src="activePlant.image_url" class="h-2/5 inline" />
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
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { listPlants, getPlant, getLink, searchPlants } from "@/services/plants"
import {
  FilterParams,
  FilterType,
  Filter,
  PageLinks,
  PageLinkKey
} from "@/store/interfaces"
import { Watch } from "vue-property-decorator"

@Component({})
export default class App extends Vue {
  public currentPage = 0
  public lastPage = 0
  public showActivePlant = false
  public pageLinks = {} as PageLinks
  public searchUpdated = true
  // TODO: extract messages to fixture, add loadingList messages
  public loadingList = false
  public loadingPlant = false
  public activePlantMessage = "Click on a plant name to see more information."
  // TODO: create interface for plant object/response
  public plantList = []
  public cachedPlantList = {} as { [key: number]: any }
  public activePlant = {}
  public filterParams = {} as FilterParams
  public searchQuery = ""

  public mounted() {
    // TODO: allow changeable filter
    this.addFilterParam("flower_color", "null", false)
    this.addFilterParam("foliage_color", "null", false)
  }

  // used on initial search, or when jumping to non-consecutive page
  public plantSearch(getPage: number) {
    if (!this.searchUpdated && getPage == this.currentPage) {
      return
    }
    this.showActivePlant = false
    if (!this.searchUpdated && this.cacheAndFetch(this.currentPage, getPage)) {
      return
    }

    this.searchUpdated = false
    const query = this.formatQuery()
    // page not cached, make API call
    this.getPlants(getPage, query)
  }

  //TODO: make global API function that directs to handlers/catchers; rename current catchers to be specific to page-changes
  public iteratePage(link: PageLinkKey) {
    // Trefle provides direct links to specific pages, use that when possible instead of re-constructing query
    let getPage = this.currentPage
    switch (link) {
      case "prev":
        getPage--
        break
      case "next":
        getPage++
        break
      case "first":
        getPage = 1
        break
      case "last":
        getPage = this.lastPage
        break
    }

    if (this.cacheAndFetch(this.currentPage, getPage)) {
      return
    }

    const apiLink = this.pageLinks[link]
    this.loadingList = true
    getLink(apiLink)
      .then((response: any) => {
        this.handleAPISuccess(getPage, response)
      })
      .catch((error: Error) => {
        this.handleAPIError(error)
      })
  }

  // TODO: add cache and fetch for plants
  public cacheAndFetch(cachePage: number, fetchPage: number): boolean {
    // cache the current page, update plant list to previously cached page (if exists)
    if (cachePage && !this.cachedPlantList[cachePage]) {
      this.cachedPlantList[cachePage] = this.plantList
    }
    const cachedPage = this.cachedPlantList[fetchPage]
    if (cachedPage) {
      this.plantList = cachedPage
      this.currentPage = fetchPage
      return true
    }
    return false
  }

  public getPlants(page: number, query: string) {
    this.loadingList = true
    let apiFunc: Function
    if (this.searchQuery.length) {
      apiFunc = searchPlants
    } else {
      apiFunc = listPlants
    }
    // TODO: response type
    apiFunc(page, query)
      .then((response: any) => {
        this.handleAPISuccess(page, response)
      })
      .catch((error: Error) => {
        this.handleAPIError(error)
      })
  }

  public handleAPISuccess(page: number, response: any) {
    this.currentPage = page
    this.plantList = response.data
    this.pageLinks = response.links
    this.loadingList = false
    // TODO: really only need to set this the first time
    this.lastPage = Math.ceil(response.meta.total / 30)
  }

  public handleAPIError(error: Error) {
    // TODO: more error handling
    console.error(error)
    this.loadingList = false
  }

  public selectPlant(id: number) {
    this.loadingPlant = true
    // TODO: response type
    getPlant(id).then((response: any) => {
      console.log(
        response.data.main_species,
        response.data.main_species == null
      )
      this.loadingPlant = false
      if (response.data.main_species == null) {
        this.activePlantMessage =
          "Sorry, this plant does not have enough information to enable display. Please select another."
        this.showActivePlant = false
        return
      }
      this.activePlant = response.data
      this.showActivePlant = true
    })
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
      console.log(filter, this.filterParams)
      for (const filterKey of Object.keys(filter)) {
        filterQuery = `${filterQuery}&${filterType}[${filterKey}]=${filter[
          filterKey
        ].join()}`
      }
    }
    return filterQuery
  }

  public formatQuery(): string {
    let query = ""
    if (this.searchQuery.length) {
      query = `&q=${this.searchQuery}`
    }
    query += this.formatFilterParams()
    console.log(query)
    return query
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
