<template>
  <div id="plant-search" class="h-full overflow-auto">
    <search-bar class="p-4" />
    <div class="relative">
      <loading
        class="absolute text-center mt-8 h-full w-full"
        v-if="plantListLoading"
        :loadingText="gardenMessages.searchBar.loading"
      />
    </div>
    <template v-if="plantList.length">
      <h3 :class="plantListLoading ? 'text-gray-300' : 'text-green-800'">
        Page {{ currentPage }} of {{ lastPage }}
      </h3>
      <plant-list
        @show-active="toggleActivePlant(true)"
        @grow-plant="growPlant(activePlant)"
        class="p-4"
      />
      <page-nav
        :class="plantListLoading ? 'text-gray-300' : 'text-green-800'"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import Loading from "@/components/Loading.vue"
import SearchBar from "@/components/SearchBar.vue"
import PlantList from "@/components/PlantList.vue"
import PageNav from "@/components/PageNav.vue"
import ActivePlant from "@/components/ActivePlant.vue"
import GardenMixin from "@/mixins/GardenMixin.vue"
import GrowMixin from "@/mixins/GrowMixin.vue"

@Component({
  components: {
    Loading,
    SearchBar,
    PlantList,
    PageNav,
    ActivePlant
  }
})
export default class PlantSearch extends mixins(GardenMixin, GrowMixin) {}
</script>
