<template>
  <div
    id="plant-search"
    class="flex flex-row h-screen transition-all ease-in-out duration-1000 relative"
    :class="plantSearchSize"
  >
    <widget :widgetData="searchWidget">
      <search-bar class="p-4" />
      <div class="relative">
        <loading
          class="absolute text-center mt-8 h-full w-full"
          v-if="plantListLoading"
          :loadingText="messages.searchBar.loading"
        />
      </div>
      <template v-if="plantList.length">
        <h3>Page {{ currentPage }} of {{ lastPage }}</h3>
        <plant-list @plant-clicked="showActivePlant" class="p-4" />
        <!-- TODO: add more buttons here to show more info, grow, or open activePlant modal -->
        <page-nav />
      </template>
    </widget>
    <widget
      v-if="plantList.length || plantLoading"
      :widgetData="activePlantWidget"
    >
      <loading
        v-if="plantLoading"
        class="mt-12"
        :loadingText="messages.activePlant.loading"
      />
      <active-plant v-else>
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
import messages from "@/fixtures/Messages"
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

  public get messages() {
    return messages
  }

  public showActivePlant() {
    if (!this.activePlantWidget.open) {
      container.toggleWidget(this.activePlantWidget)
    }
  }
}
</script>
