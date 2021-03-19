<template>
  <div id="search-bar" class="shadow-sm flex  mb-2">
    <input
      id="search-input"
      class="p-2 flex-grow text-center"
      type="text"
      v-model="searchQuery"
      :placeholder="messages.searchBar.placeholder"
      :title="messages.searchBar.placeholder"
      @keyup.enter="plantSearch()"
    />
    <button
      :disabled="!searchUpdated"
      @click="plantSearch()"
      class="btn-primary"
    >
      Search plants
    </button>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import { Watch } from "vue-property-decorator"
import {
  Filter,
  FilterParams,
  FilterType,
  PlantListPayload
} from "@/store/interfaces"
import GardenMixin, { garden } from "@/mixins/GardenMixin.vue"
import messages from "@/fixtures/Messages"

@Component({})
export default class SearchBar extends GardenMixin {
  public filterParams = {} as FilterParams
  public searchQuery = ""
  public searchUpdated = true

  public mounted() {
    // TODO: add an actual filter UI and make these optional
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
        newSearch: true
      }
      garden.getPlantList(payload)
    }
  }

  @Watch("searchQuery")
  onSearchChanged() {
    this.searchUpdated = true
  }

  public get messages() {
    return messages
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

<style scoped></style>
