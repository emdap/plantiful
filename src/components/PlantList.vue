<template>
  <div id="search-results" class="flex-grow overflow-auto">
    <div
      v-for="(plant, index) in plantList"
      :key="`plant ${index}`"
      @click="selectPlant(plant.id)"
      :class="
        plantListLoading
          ? 'text-gray-300 cursor-wait'
          : 'cursor-pointer hover:bg-green-200'
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

@Component({})
export default class PlantList extends GardenMixin {
  public selectPlant(id: number) {
    if (!this.plantListLoading) {
      garden.getOnePlant(id)
      this.$emit("plant-clicked")
    }
  }

  // TODO: put watch on plantListLoading, add a ref to the list, and reset the scroll
}
</script>

<style scoped></style>
