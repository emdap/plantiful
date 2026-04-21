<template>
  <div
    id="plant-search"
    class="flex overflow-auto scrollbar-light dark:scrollbar-dark flex-grow flex-col gap-1"
  >
    <modal
      v-if="showModal"
      @close="showModal = false"
      @continue="continueDelete"
    />
    <search-bar class="p-4" />
    <div class="relative h-full" style="min-height: 100px">
      <loading
        class="absolute w-full h-full bg-green-50 dark:bg-gray-600 bg-opacity-90 dark:bg-opacity-90 rounded text-center top-0 left-0 z-50 flex justify-center items-center"
        v-if="plantListLoading"
        :loadingText="gardenMessages.searchBar.loading"
      />
      <plant-list
        @show-active="toggleActivePlant(true)"
        @grow-plant="checkAndGrow"
        class="pb-4"
      />
    </div>
    <page-nav
      :class="
        plantListLoading
          ? 'text-gray-300 dark:text-gray-800'
          : 'text-green-800 dark:text-green-600'
      "
    />
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
import Modal from "@/components/Modal.vue"

@Component({
  components: {
    Loading,
    SearchBar,
    PlantList,
    PageNav,
    Modal,
  },
})
export default class PlantSearch extends mixins(GardenMixin, GrowMixin) {
  public showModal = false

  public continueDelete() {
    this.deleteOldestPlant()
    this.checkAndGrow()
    this.showModal = false
  }

  public checkAndGrow() {
    if (!this.activePlant) {
      return
    }
    if (!this.showModal && this.overBranchLimit) {
      this.showModal = true
      return
    }
    this.growPlant(this.activePlant)
  }
}
</script>
