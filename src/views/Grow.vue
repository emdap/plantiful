<template>
  <div id="grow" class="h-full w-full">
    <span v-if="!hasGrowPlants" class="text-gray-500 font-semibold mt-10">
      Open up the search to find & grow plants!
      <button
        class="btn-primary my-4 mx-auto block"
        @click="$emit('search-plants')"
      >
        Start Searching
      </button>
    </span>
    <div
      v-else
      id="plant-wrapper"
      class="h-full w-full"
      @mousedown="activateWindow(true)"
      @mouseup="activateWindow(false)"
      @dblclick.self="removeActive()"
    >
      <plant v-for="plant in growPlants" :key="plant.id" :plantData="plant" />
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import Plant from "@/components/Grow/Plant.vue"
import Controls from "@/views/Controls.vue"
import { GridWidget } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"

@Component({
  components: {
    Plant,
    Controls
  }
})
export default class Grow extends GrowMixin {
  // @Prop({ required: true }) widget!: GridWidgetCopy
  // @Prop({ required: true }) controlsGridWidget!: GridWidget

  public removeActive() {
    grow.removeActivePlant()
  }

  public activateWindow(activate: boolean) {
    grow.setGrowWindowActive(activate)
  }
}
</script>
