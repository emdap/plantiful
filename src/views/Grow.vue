<template>
  <div :id="containerId" class="flex flex-grow h-full overflow-hidden">
    <widget :widgetData="growWidget" @click.self="activateWindow(false)">
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
import { WidgetEntity } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"

@Component({
  components: {
    Widget,
    Plant
  }
})
export default class Grow extends GrowMixin {
  @Prop({ required: true }) growWidget!: WidgetEntity

  public removeActive() {
    grow.removeActivePlant()
  }

  public activateWindow(activate: boolean) {
    grow.setGrowWindowActive(activate)
  }
}
</script>
