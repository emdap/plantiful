<template>
  <div
    id="plant-search"
    class="flex flex-row gap-1 h-screen transition-all ease-in-out duration-1000 relative"
    :class="plantSearchSize"
  >
    <widget :widgetData="searchWidget">
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
    </widget>
    <widget
      v-if="plantList.length || plantLoading"
      :widgetData="activePlantWidget"
    >
      <active-plant>
        <button class="btn-primary" @click="$emit('grow-plant', $event)">
          Grow
        </button>
      </active-plant>
    </widget>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import Widget from "@/components/Widget.vue"
import Loading from "@/components/Loading.vue"
import SearchBar from "@/components/SearchBar.vue"
import PlantList from "@/components/PlantList.vue"
import PageNav from "@/components/PageNav.vue"
import ActivePlant from "@/components/ActivePlant.vue"
import GardenMixin from "@/mixins/GardenMixin.vue"
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import { WidgetEntity } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"

@Component({
  components: {
    Widget,
    Loading,
    SearchBar,
    PlantList,
    PageNav,
    ActivePlant
  }
})
export default class PlantSearch extends mixins(GardenMixin, ContainerMixin) {
  @Prop({ default: 0 }) plantSearchSize!: number
  @Prop({ required: true }) searchWidget!: WidgetEntity
  @Prop({ required: true }) activePlantWidget!: WidgetEntity

  public showActivePlant() {
    console.log("show active plant received")
    if (!this.activePlantWidget.open) {
      container.toggleWidget(this.activePlantWidget)
    }
  }
}
</script>
