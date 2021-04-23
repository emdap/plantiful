<template>
  <div id="plant-search" class="flex overflow-auto flex-grow flex-col gap-1">
    <search-bar class="p-4" />
    <div class="relative">
      <loading
        class="absolute text-center mt-8 h-full w-full"
        v-if="plantListLoading"
        :loadingText="gardenMessages.searchBar.loading"
      />
    </div>
    <template v-if="plantList.length">
      <plant-list
        @show-active="toggleActivePlant(true)"
        @grow-plant="growPlant(activePlant)"
        class="p-4"
      />
      <h4
        :class="
          plantListLoading
            ? 'text-gray-300 dark:text-gray-800'
            : 'text-green-800 dark:text-yellow-600'
        "
      >
        Page {{ currentPage }} of {{ lastPage }}
      </h4>
      <page-nav
        :class="
          plantListLoading
            ? 'text-gray-300 dark:text-gray-800'
            : 'text-green-800 dark:text-green-600'
        "
      />
    </template>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import Loading from "@/components/Loading.vue"
import SearchBar from "@/components/Garden/SearchBar.vue"
import PlantList from "@/components/Garden/PlantList.vue"
import PageNav from "@/components/Garden/PageNav.vue"
import GardenMixin from "@/mixins/GardenMixin.vue"
import GrowMixin from "@/mixins/GrowMixin.vue"

@Component({
  components: {
    Loading,
    SearchBar,
    PlantList,
    PageNav
  }
})
export default class PlantSearch extends mixins(GardenMixin, GrowMixin) {}
</script>
