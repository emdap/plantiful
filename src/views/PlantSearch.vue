<template>
  <!-- <adjustable :widgetData="widget"> -->
  <div>
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
        @show-active="showActivePlant"
        @grow-plant="$emit('grow-plant', $event)"
        class="p-4"
      />
      <page-nav
        :class="plantListLoading ? 'text-gray-300' : 'text-green-800'"
      />
    </template>
    <!-- </adjustable> -->
  </div>
  <!-- <adjustable
      v-if="plantList.length || plantLoading"
      :widgetData="activePlantGridWidget"
    >
      <active-plant>
        <button class="btn-primary" @click="$emit('grow-plant', $event)">
          Grow
        </button>
      </active-plant>
    </adjustable> -->
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
// import Adjustable from "@/components/Widget.vue"
import Loading from "@/components/Loading.vue"
import SearchBar from "@/components/SearchBar.vue"
import PlantList from "@/components/PlantList.vue"
import PageNav from "@/components/PageNav.vue"
import ActivePlant from "@/components/ActivePlant.vue"
import GardenMixin from "@/mixins/GardenMixin.vue"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import { GridWidget } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"

@Component({
  components: {
    // Adjustable,
    Loading,
    SearchBar,
    PlantList,
    PageNav,
    ActivePlant
  }
})
export default class PlantSearch extends mixins(GardenMixin, GridMixin) {
  // @Prop({ default: 0 }) plantSearchSize!: number
  // @Prop({ required: true }) widget!: GridWidgetCopy
  // @Prop({ required: true }) activePlantGridWidget!: GridWidgetCopy
  // public mounted() {
  //   console.log(this.widget)
  // }
  // public showActivePlant() {
  //   if (!this.activePlantGridWidget.open) {
  //     grid.toggleGridWidget(this.activePlantGridWidget)
  //   }
  // }
}
</script>
