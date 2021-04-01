<template>
  <div :id="containerId" class="flex flex-grow h-full overflow-hidden">
    <widget
      :initWidgetState="growWidget.entity"
      :initDisplay="growWidget.display"
      @click.self="activateWindow(false)"
    >
      <div
        id="plant-wrapper"
        class="h-full w-full"
        @mousedown="activateWindow(true)"
        @mouseup="activateWindow(false)"
        @dblclick.self="removeActive()"
      >
        <plant v-for="plant in growPlants" :key="plant.id" :plantData="plant" />
      </div>
    </widget>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import Plant from "@/components/Grow/Plant.vue"
import Widget from "@/components/Widget.vue"
import { WidgetInit } from "@/store/interfaces"
import PlantIcon from "@/assets/icons/plant.svg"
// temp
import { TEST_PLANT } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Widget,
    Plant
  }
})
export default class Grow extends GrowMixin {
  public growWidget: WidgetInit = {
    entity: {
      name: "grow",
      icon: PlantIcon,
      open: false,
      docked: true,
      inMenu: true
    },
    display: {
      flexGrow: true
    }
  }

  public mounted() {
    // temp
    this.growPlant(TEST_PLANT)
  }

  public removeActive() {
    grow.removeActivePlant()
  }

  public activateWindow(activate: boolean) {
    grow.setGrowWindowActive(activate)
  }
}
</script>
