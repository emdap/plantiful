<template>
  <div
    id="plant-search"
    class="flex flex-row h-screen transition-all ease-in-out duration-1000 relative"
    :class="plantWindowSize"
  >
    <widget
      :initDisplay="searchWidget.display"
      :initWidgetState="searchWidget.state"
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
      :initWidgetState="activePlantWidget.state"
    >
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
import { WidgetInit, WidgetState } from "@/store/interfaces"
import { Watch } from "vue-property-decorator"

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
  public searchWidget: WidgetInit = {
    state: {
      name: "search",
      icon: "S",
      open: true,
      docked: true,
      inMenu: true
    },
    display: {
      height: "full",
      width: "full"
    }
  }

  public activePlantWidget: WidgetInit = {
    state: {
      name: "active-plant",
      icon: "A",
      open: false,
      docked: false,
      inMenu: false
    },
    display: {
      width: "20vw",
      left: "100%"
      // left: "calc(50vw + 2.75rem)"
    }
  }
  public get fullScreenSearch() {
    return (
      this.searchWidget.state.open &&
      window.widgets.filter(w => {
        return w.open
      }).length <= 1
    )
  }

  public get plantWindowSize() {
    const searchOnly =
      this.searchWidget.state.open &&
      window.widgets.filter(w => {
        return w.open
      }).length <= 1
    if (searchOnly) {
      return "w-full"
    } else if (
      this.searchWidget.state.open &&
      this.activePlantWidget.state.open
    ) {
      return "w-half"
    } else {
      return ""
    }
  }

  public mounted() {
    // register widgets
    // don't really need to register this one from here?
    // window.registerWidget(this.searchWidget)
    window.registerWidget(this.activePlantWidget.state as WidgetState)
  }

  public get messages() {
    return messages
  }

  public showActivePlant() {
    if (!this.activePlantWidget.state.open) {
      window.toggleWidget(this.activePlantWidget.state as WidgetState)
    }
  }
}
</script>
