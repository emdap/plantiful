<template>
  <div class="h-full w-full flex flex-row overflow-auto">
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
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import GrowMixin from "@/mixins/GrowMixin.vue"
import widgetFixture from "@/fixtures/Widgets"
import PlantSearch from "@/views/PlantSearch.vue"
import Grow from "@/views/Grow.vue"
import Welcome from "@/views/Welcome.vue"
import Loading from "@/components/Loading.vue"
import { WidgetEntity } from "@/store/interfaces"
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
  ContainerMixin,
  GrowMixin
) {
  // for any logic that requires knowledge of all widgets

  public created() {
    // register widgets
    for (const widget of widgetFixture) {
      container.registerWidget(widget)
    }
  }

  public get searchWidget(): WidgetEntity | null {
    return this.getWidget("search")
  }

  public get activePlantWidget(): WidgetEntity | null {
    return this.getWidget("active-plant")
  }

  public get growWidget(): WidgetEntity | null {
    return this.getWidget("grow")
  }

  public get welcomeWidget(): WidgetEntity | null {
    return this.getWidget("welcome")
  }

  public get controlsWidget(): WidgetEntity | null {
    return this.getWidget("controls")
  }

  public closeAndSearch() {
    if (this.searchWidget && !this.searchWidget.open)
      container.toggleWidget(this.searchWidget)
    if (this.growWidget && this.growWidget.open)
      container.toggleWidget(this.growWidget)
  }

  public dockAndGrow(e: MouseEvent) {
    e.stopPropagation()
    if (this.activePlant) {
      if (this.activePlantWidget && !this.activePlantWidget.isDocked)
        container.toggleDocked(this.activePlantWidget)
      this.growPlant(this.activePlant)
    }
  }

  public get plantSearchSize() {
    if (!this.searchWidget) {
      return 0
    }
    // add diff sizes depending if active plant widget is docked
    const searchOnly = this.searchWidget.open && this.countOpenWidgets == 1
    if (searchOnly) {
      return "w-full"
    } else if (!this.searchWidget.open && !this.activePlantWidget?.isDocked) {
      return 0
    } else {
      return "w-2/5"
    }
  }

  // don't want welcome screen and search visible at same time
  @Watch("searchWidget.open")
  public searchOpened(open: boolean) {
    if (open && this.welcomeWidget && this.welcomeWidget.open) {
      container.toggleWidget(this.welcomeWidget)
    }
  }

  @Watch("welcomeWidget.open")
  public welcomeOpened(open: boolean) {
    // don't want welcome screen and search visible at same time
    if (open && this.searchWidget && this.searchWidget.open) {
      container.toggleWidget(this.searchWidget)
    }
  }

  @Watch("growWidget.open")
  public growToggled(open: boolean) {
    if (this.controlsWidget && !open && this.controlsWidget.open) {
      container.toggleWidget(this.controlsWidget)
    }
  }

  @Watch("hasGrowPlants")
  public noGrow(hasPlants: boolean) {
    if (this.growWidget && this.growWidget.open && !hasPlants) {
      container.toggleWidget(this.growWidget)
    }
  }

  @Watch("showControls")
  public toggleControls(show: boolean) {
    if (this.controlsWidget && show != this.controlsWidget.open) {
      container.toggleWidget(this.controlsWidget)
    }
  }
}
</script>

<style scoped></style>
