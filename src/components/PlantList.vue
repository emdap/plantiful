<template>
  <div id="search-results" ref="plant-list" class="flex-grow overflow-auto">
    <div
      v-for="(plant, index) in plantList"
      :key="`plant ${index}`"
      @click="selectPlant(plant.id)"
      class="mb-2 px-4 py-2 text-left"
      :class="
        plantListLoading
          ? 'text-gray-300 cursor-wait'
          : 'cursor-pointer hover:bg-green-200 hover:tracking-wide transition-text'
      "
    >
      <h3>{{ plant.common_name }}</h3>
      <h5>{{ plant.scientific_name }}</h5>
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GardenMixin, { garden } from "@/mixins/GardenMixin.vue"
import { Ref, Watch } from "vue-property-decorator"

@Component({})
export default class PlantList extends GardenMixin {
  @Ref("plant-list") readonly plantListDiv!: HTMLDivElement

  public selectPlant(id: number) {
    if (!this.plantListLoading) {
      garden.getOnePlant(id)
      this.$emit("plant-clicked")
    }
  }

  @Watch("plantList")
  public resetScroll() {
    this.plantListDiv.scrollTop = 0
  }
}
</script>

<style scoped></style>
