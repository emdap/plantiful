<template>
  <div
    id="search-results"
    class="flex-grow overflow-auto text-gr"
    :class="{ 'text-gray-500 cursor-wait': garden.plantListLoading }"
  >
    <div
      v-for="(plant, index) in plantList"
      :key="`plant ${index}`"
      @click="selectPlant(plant.id)"
      class="cursor-pointer hover:bg-green-200"
    >
      <h3>{{ activePlant.common_name }}</h3>
      <h5>{{ activePlant.scientific_name }}</h5>
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
    }
  }
}
</script>

<style scoped></style>
