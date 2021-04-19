<template>
  <div class="h-full w-full flex flex-row gap-2 py-2 overflow-auto">
    <welcome @search-plants="closeAndSearch" />
    <plant-search
      v-if="searchWidget && activePlantWidget"
      :searchWidget="searchWidget"
      :activePlantWidget="activePlantWidget"
      :plantSearchSize="plantSearchSize"
      @grow-plant="dockAndGrow"
    />
    <grow
      v-if="growWidget && controlsWidget"
      :growWidget="growWidget"
      :controlsWidget="controlsWidget"
      @search-plants="closeAndSearch"
    />
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import GardenMixin from "@/mixins/GardenMixin.vue"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import GrowMixin from "@/mixins/GrowMixin.vue"
// import widgetFixture from "@/fixtures/Grid/Widgets old"
import PlantSearch from "@/views/PlantSearch.vue"
import Grow from "@/views/Grow.vue"
import Welcome from "@/views/Welcome.vue"
import Loading from "@/components/Loading.vue"
// import { Widget } from "@/store/interfaces"
import { Watch } from "vue-property-decorator"

@Component({
  components: {
    Welcome,
    PlantSearch,
    Grow,
    Loading
  }
})
export default class WidgetController extends mixins(
  GardenMixin,
  GridMixin,
  GrowMixin
) {
  // for any logic that requires knowledge of all widgets
  //   public created() {
  //     // register widgets
  //     for (const widget of widgetFixture) {
  //       grid.registerWidget(widget)
  //     }
  //   }
  //   public get searchWidget(): Widget | null {
  //     return this.getWidget("search")
  //   }
  //   public get activePlantWidget(): Widget | null {
  //     return this.getWidget("active-plant")
  //   }
  //   public get growWidget(): Widget | null {
  //     return this.getWidget("grow")
  //   }
  //   public get welcomeWidget(): Widget | null {
  //     return this.getWidget("welcome")
  //   }
  //   public get controlsWidget(): Widget | null {
  //     return this.getWidget("controls")
  //   }
  //   public closeAndSearch() {
  //     if (this.searchWidget && !this.searchWidget.open)
  //       grid.toggleWidget(this.searchWidget)
  //     if (this.growWidget && this.growWidget.open)
  //       grid.toggleWidget(this.growWidget)
  //   }
  //   public dockAndGrow(e: MouseEvent) {
  //     e.stopPropagation()
  //     if (this.activePlant) {
  //       if (this.activePlantWidget && !this.activePlantWidget.isDocked)
  //         grid.toggleDocked(this.activePlantWidget)
  //       this.growPlant(this.activePlant)
  //     }
  //   }
  //   public get plantSearchSize() {
  //     if (!this.searchWidget) {
  //       return 0
  //     }
  //     // add diff sizes depending if active plant widget is docked
  //     const searchOnly = this.searchWidget.open && this.countOpenWidgets == 1
  //     if (searchOnly) {
  //       return "w-full"
  //     } else if (!this.searchWidget.open) {
  //       return 0
  //     } else {
  //       return "w-2/5"
  //     }
  //   }
  //   // don't want welcome screen and search visible at same time
  //   @Watch("searchWidget.open")
  //   public searchOpened(open: boolean) {
  //     if (open && this.welcomeWidget && this.welcomeWidget.open) {
  //       grid.toggleWidget(this.welcomeWidget)
  //     }
  //   }
  //   @Watch("welcomeWidget.open")
  //   public welcomeOpened(open: boolean) {
  //     // don't want welcome screen and search visible at same time
  //     if (open && this.searchWidget && this.searchWidget.open) {
  //       grid.toggleWidget(this.searchWidget)
  //     }
  //   }
  //   @Watch("growWidget.open")
  //   public growToggled(open: boolean) {
  //     if (this.controlsWidget && !open && this.controlsWidget.open) {
  //       grid.toggleWidget(this.controlsWidget)
  //     }
  //   }
  //   @Watch("hasGrowPlants")
  //   public noGrow(hasPlants: boolean) {
  //     if (this.growWidget && this.growWidget.open && !hasPlants) {
  //       grid.toggleWidget(this.growWidget)
  //     }
  //   }
  //   @Watch("showControls")
  //   public toggleControls(show: boolean) {
  //     if (this.controlsWidget && show != this.controlsWidget.open) {
  //       grid.toggleWidget(this.controlsWidget)
  //     }
  //   }
}
</script>
