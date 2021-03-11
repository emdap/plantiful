<template>
  <div id="active-plant" class="p-4 flex-grow overflow-auto flex-col">
    <span v-if="noActivePlant">
      {{ noActivePlant }}
    </span>
    <template v-else>
      <!-- use properties under main_species when possible, has more consistent capitalization, especially for common_name -->
      <h1>{{ activePlant.main_species.common_name }}</h1>
      <h3>{{ activePlant.main_species.scientific_name }}</h3>
      <loading v-if="!mainImgLoaded" loadingText="Loading image" />
      <img
        @load="mainImgLoaded = true"
        :src="activePlant.image_url"
        class=" max-h-96 inline"
        :class="{ hidden: !mainImgLoaded }"
      />
      <ul>
        <li v-for="(info, index) in showFields" :key="`active-info-${index}`">
          <template v-if="info.value">
            <strong> {{ info.text }}: </strong> {{ info.value }}
          </template>
        </li>
      </ul>
      <button class="btn-primary" @click="$emit('grow-plant')">
        Grow
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import { Watch } from "vue-property-decorator"
import GardenMixin from "@/mixins/GardenMixin.vue"
import { ActivePlantInfo } from "@/store/interfaces"
import messages from "@/fixtures/Messages"
import Loading from "@/components/Loading.vue"

@Component({
  components: {
    Loading
  }
})
export default class ActivePlant extends GardenMixin {
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
      return messages.activePlant.info
    } else if (!this.activePlant?.main_species) {
      return messages.activePlant.error
    }
    return false
  }

  @Watch("activePlant")
  public newMainImg() {
    this.mainImgLoaded = false
  }
}
</script>

<style scoped></style>
