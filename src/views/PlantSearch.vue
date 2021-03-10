<template>
  <div id="plant-search" class="flex flex-row flex-grow h-screen">
    <widget initHeight="full" initWidth="400" :initWidgetState="searchWidget">
      <search-bar />
      <loading
        v-if="plantListLoading"
        :loadingText="messages.searchBar.loading"
      />
      <template v-if="plantList.length">
        <page-nav />
        <plant-list @plant-clicked="showActivePlant" />
      </template>
    </widget>
    <widget
      v-if="plantList.length || plantLoading"
      initWidth="25%"
      :initLeft="400"
      :initWidgetState="activePlantWidget"
    >
      <!-- initHeight="75%" -->
      <loading
        v-if="plantLoading"
        :loadingText="messages.activePlant.loading"
      />
      <active-plant v-else />
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
import WindowMixin, { window } from "@/mixins/WindowMixin.vue"
import { WidgetState } from "@/store/interfaces"

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
export default class PlantSearch extends mixins(GardenMixin, WindowMixin) {
  public searchWidget: WidgetState = {
    name: "search",
    icon: "S",
    order: 1,
    open: true,
    docked: true,
    inMenu: true
  }

  public activePlantWidget: WidgetState = {
    name: "active-plant",
    icon: "A",
    order: 2,
    open: false,
    docked: false,
    inMenu: false
  }

  public mounted() {
    // register widgets
    // don't really need to register this one from here?
    // window.registerWidget(this.searchWidget)
    window.registerWidget(this.activePlantWidget)
  }

  public get messages() {
    return messages
  }

  public showActivePlant() {
    if (!this.activePlantWidget.open) {
      window.toggleWidget(this.activePlantWidget)
    }
  }
}
</script>

<style scoped></style>
