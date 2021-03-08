<template>
  <div id="active-plant" class="p-4 flex-grow overflow-auto flex-col">
    <span v-if="noActivePlant">
      {{ noActivePlantMessage }}
    </span>
    <template v-else>
      <h1>{{ activePlant.common_name }}</h1>
      <h3>{{ activePlant.scientific_name }}</h3>
      <img :src="activePlant.image_url" class="max-h-full" />
      <ul>
        <li v-for="(info, index) in showFields" :key="`active-info-${index}`">
          <strong> {{ info.text }}: </strong> {{ info.value }}
        </li>
      </ul>
      <button class="btn-primary">
        Grow
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GardenMixin from "@/mixins/GardenMixin.vue"
import { ActivePlantInfo } from "@/store/interfaces"
import messages from "@/fixtures/Messages"

@Component({})
export default class ActivePlant extends GardenMixin {
  public showFields: ActivePlantInfo[] = [
    {
      text: "Flower colors",
      value: this.activePlant?.main_species.flower.color?.join()
    },
    {
      text: "Foliage colors",
      value: this.activePlant?.main_species.foliage.color?.join()
    },
    {
      text: "Foliage texture",
      value: this.activePlant?.main_species.foliage.texture
    },
    {
      text: "Average height",
      value: this.activePlant?.main_species.specifications.average_height.cm
    },
    {
      text: "Shape and orientation",
      value: this.activePlant?.main_species.specifications.shape_and_orientation
    },
    {
      text: "Growth spread",
      value: this.activePlant?.main_species.growth.spread.cm
    }
  ]

  public get noActivePlant() {
    if (!this.activePlant) {
      return messages.activePlant.info
    } else if (!this.activePlant?.main_species) {
      return messages.activePlant.error
    }
    return false
  }
}
</script>

<style scoped></style>
