<template>
  <div
    id="search-bar"
    class="border-b-1 border-gray-100 dark:border-gray-800 mb-4 w-full"
  >
    <div
      class="ring-pink-400 dark:ring-gray-300 flex rounded-sm"
      :class="{ 'ring-2': inputFocus }"
    >
      <input
        id="search-input"
        class="font-semibold w-full border-0 rounded-sm rounded-r-none bg-gray-50 dark:bg-gray-800 focus:bg-green-50 dark:focus:bg-gray-500 p-2 pl-4 flex-grow text-left focus:ring-0 dark:focus:ring-0"
        type="text"
        v-model="searchQuery"
        :placeholder="gardenMessages.searchBar.placeholder"
        :title="gardenMessages.searchBar.placeholder"
        @focus="inputFocus = true"
        @blur="inputFocus = false"
        @keyup.enter="plantSearch()"
      />
      <button
        :disabled="!searchUpdated"
        @click="plantSearch()"
        title="Search"
        class="btn-light dark:btn-dark fill-current rounded-sm rounded-l-none focus:ring-0"
      >
        <search-icon />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import { Watch } from "vue-property-decorator"
import {
  Filter,
  FilterParams,
  FilterType,
  PlantListPayload,
} from "@/store/interfaces"
import GardenMixin, { garden } from "@/mixins/GardenMixin.vue"
import SearchIcon from "@/assets/icons/search.svg"

@Component({
  components: {
    SearchIcon,
  },
})
export default class SearchBar extends GardenMixin {
  public filterParams = {} as FilterParams
  public searchQuery = ""
  public searchUpdated = true
  public inputFocus = false

  public mounted() {
    // [redacted: no API] TODO: add an actual filter UI and make these optional
    this.addFilterParam("flower_color", "null", false)
    this.addFilterParam("foliage_color", "null", false)
  }

  public plantSearch() {
    if (this.searchUpdated) {
      this.searchUpdated = false
      const payload: PlantListPayload = {
        page: 1,
        filter: this.formatFilterParams(),
        query: this.searchQuery,
        newSearch: true,
      }
      garden.getPlantList(payload)
    }
  }

  @Watch("searchQuery")
  onSearchChanged() {
    this.searchUpdated = true
  }

  // filters
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
}
</script>
