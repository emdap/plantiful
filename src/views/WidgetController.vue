<template>
  <div class="h-full w-full flex flex-row">
    <plant-search
      v-if="searchWidget && activePlantWidget"
      :searchWidget="searchWidget"
      :activePlantWidget="activePlantWidget"
      :plantSearchSize="plantSearchSize"
      @grow-plant="dockAndGrow"
    />
    <grow v-if="growWidget" :growWidget="growWidget" />
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
import { WidgetEntity } from "@/store/interfaces"

@Component({
  components: {
    PlantSearch,
    Grow
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

  public dockAndGrow(e: MouseEvent) {
    e.stopPropagation()
    if (this.activePlant) {
      if (this.activePlantWidget && !this.activePlantWidget.docked)
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
    } else if (!this.searchWidget.open && !this.activePlantWidget?.docked) {
      return 0
    } else {
      return "w-2/5"
    }
  }
}
</script>

<style scoped></style>
