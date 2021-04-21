<template>
  <div id="active-plant" class="p-4 flex-grow overflow-auto flex-col">
    <loading
      v-if="plantLoading"
      class="mt-12"
      :loadingText="gardenMessages.activePlant.loading"
    />
    <div v-else-if="noActivePlant" class="text-gray-500 font-semibold mt-10">
      <span>{{ noActivePlant }}</span>
    </div>
    <template v-else>
      <!-- use properties under main_species when possible, has more consistent capitalization, especially for common_name -->
      <h1>{{ activePlant.main_species.common_name }}</h1>
      <h3>{{ activePlant.main_species.scientific_name }}</h3>
      <loading v-if="!mainImgLoaded" loadingText="Loading image" />
      <img
        @load="mainImgLoaded = true"
        :src="activePlant.image_url"
        class="h-1/2 max-h-96 inline object-cover"
        :class="{ hidden: !mainImgLoaded }"
      />
      <ul class="mb-4">
        <li v-for="(info, index) in showFields" :key="`active-info-${index}`">
          <template v-if="info.value">
            <strong> {{ info.text }}: </strong> {{ info.value }}
          </template>
        </li>
      </ul>
      <button class="btn-primary" @click="growPlant(activePlant)">Grow</button>
    </template>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import { Watch } from "vue-property-decorator"
import GardenMixin from "@/mixins/GardenMixin.vue"
import GrowMixin from "@/mixins/GrowMixin.vue"
import { ActivePlantInfo } from "@/store/interfaces"
import Loading from "@/components/Loading.vue"

@Component({
  components: {
    Loading
  }
})
export default class ActivePlant extends mixins(GardenMixin, GrowMixin) {
  // have ability to display additional images in future
  public mainImgLoaded = false

  public get showFields(): ActivePlantInfo[] {
    return [
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
        value: this.activePlant?.main_species.specifications
          .shape_and_orientation
      },
      {
        text: "Growth spread",
        value: this.activePlant?.main_species.growth.spread.cm
      }
    ]
  }
  public get noActivePlant() {
    if (!this.activePlant) {
      return this.gardenMessages.activePlant.info
    } else if (!this.activePlant?.main_species) {
      return this.gardenMessages.activePlant.error
    }
    return false
  }

  @Watch("activePlant")
  public newMainImg() {
    this.mainImgLoaded = false
  }
}
</script>
