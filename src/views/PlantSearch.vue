<template>
  <div
    id="plant-search"
    class="flex flex-row h-screen transition-all ease-in-out duration-1000 relative"
    :class="plantContainerSize"
    @click="removeMouseTracking"
  >
    <widget
      :initDisplay="searchWidget.display"
      :initWidgetState="searchWidget.entity"
    >
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
      :initDisplay="activePlantWidget.display"
      :initWidgetState="activePlantWidget.entity"
    >
      <loading
        v-if="plantLoading"
        :loadingText="messages.activePlant.loading"
      />
      <active-plant v-else @grow-plant="dockAndGrow" />
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
import GardenMixin, { garden } from "@/mixins/GardenMixin.vue"
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { WidgetInit, WidgetEntity } from "@/store/interfaces"
import SearchIcon from "@/assets/icons/search.svg"

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
// TODO: want to move most of this functionality to an overall view that tracks all the widgets
export default class PlantSearch extends mixins(
  GardenMixin,
  ContainerMixin,
  GrowMixin
) {
  public isFullScreen = false

  public searchWidget: WidgetInit = {
    entity: {
      name: "search",
      icon: SearchIcon,
      open: true,
      docked: true,
      inMenu: true
    },
    display: {
      height: "full",
      flexGrow: true
      // width: this.plantSearchWidth
    }
  }

  public activePlantWidget: WidgetInit = {
    entity: {
      name: "active-plant",
      icon: "A",
      open: false,
      docked: false,
      inMenu: false
    },
    display: {
      width: "20vw",
      left: "100%"
    }
  }

  public removeMouseTracking() {
    grow.removeActiveEntity()
  }

  public get plantContainerSize() {
    const searchOnly =
      this.searchWidget.entity.open && this.countOpenWidgets <= 1
    if (searchOnly) {
      return "w-full"
      // } else if (
      //   this.countOpenWidgets == 2 &&
      //   this.searchWidget.entity.open &&
      //   this.activePlantWidget.entity.open
      // ) {
      //   return "w-1/3"
    } else {
      return "w-2/5"
    }
  }

  public mounted() {
    // register widgets
    // don't really need to register this one from here?
    // container.registerWidget(this.searchWidget)
    container.registerWidget(this.activePlantWidget.entity as WidgetEntity)
  }

  public get messages() {
    return messages
  }

  public showActivePlant() {
    if (!this.activePlantWidget.entity.open) {
      container.toggleWidget(this.activePlantWidget.entity as WidgetEntity)
    }
  }

  public dockAndGrow(e: MouseEvent) {
    console.log(e)
    e.stopPropagation()
    if (this.activePlant) {
      if (!this.activePlantWidget.entity.docked)
        container.toggleDocked(this.activePlantWidget.entity)
      this.growPlant(this.activePlant)
    }
  }
}
</script>
