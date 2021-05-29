<template>
  <div
    id="active-plant"
    class="flex-grow overflow-auto scrollbar-light dark:scrollbar-dark flex-col"
  >
    <modal
      v-if="showModal"
      @close="showModal = false"
      @continue="continueDelete"
    />
    <trefle-warning widget="active-plant" />
    <loading
      v-if="plantLoading"
      class="mt-12"
      :loadingText="gardenMessages.activePlant.loading"
    />
    <div v-else-if="noActivePlant" class="font-semibold mt-10">
      <span>{{ noActivePlant }}</span>
    </div>
    <template v-else>
      <!-- use properties under main_species when possible, has more consistent capitalization, especially for common_name -->
      <div
        class="my-2 p-2 bg-white dark:bg-gray-700 sticky transition-colors top-0 border-b-1 dark:border-gray-800"
      >
        <h1>{{ activePlant.main_species.common_name }}</h1>
        <h3>{{ activePlant.main_species.scientific_name }}</h3>
      </div>
      <div class="my-4 flex flex-wrap gap-8 justify-center items-top">
        <loading
          v-if="!mainImgLoaded && activePlant.image_url.length"
          loadingText="Loading image"
        />
        <img
          @load="mainImgLoaded = true"
          @click="expandImg = !expandImg"
          :src="activePlant.image_url"
          class="cursor-pointer inline object-cover transition-all"
          :class="{
            hidden: !mainImgLoaded,
            'max-h-60': !expandImg,
            'max-h-screen': expandImg,
          }"
        />
        <ul class="mb-4">
          <li v-for="(info, index) in showFields" :key="index">
            <div
              class="flex flex-wrap gap-2 items-center p-2 border-b-1 dark:border-gray-800"
              v-if="info.value"
            >
              <strong> {{ info.text }}: </strong>
              <span class="text-right flex-grow">{{ info.value }}</span>
            </div>
          </li>
          <li v-for="(colors, index) in showColors" :key="'colors-' + index">
            <div
              class="flex flex-wrap gap-3 py-2 pl-2 w-full items-center border-b-1 dark:border-gray-800"
              v-if="colors.value"
            >
              <strong class="text-right"> {{ colors.text }}: </strong>
              <div class="flex flex-wrap justify-end flex-grow">
                <div
                  v-for="(color, index) in colors.value"
                  :key="'color-' + index"
                  class="p-1 m-1 w-9 h-6 shadow-sm flex justify-end"
                  :style="{ background: color }"
                />
              </div>
            </div>
          </li>
          <button class="btn-light px-6 mt-6" @click="checkAndGrow">
            Grow this plant
          </button>
        </ul>
      </div>
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
import TrefleWarning from "@/components/Garden/TrefleWarning.vue"
import Modal from "@/components/Modal.vue"

@Component({
  components: {
    Loading,
    TrefleWarning,
    Modal,
  },
})
export default class ActivePlant extends mixins(GardenMixin, GrowMixin) {
  public showModal = false

  // have ability to display additional images in future
  public mainImgLoaded = false
  public expandImg = false

  public continueDelete() {
    this.deleteOldestPlant()
    this.checkAndGrow()
    this.showModal = false
  }

  public checkAndGrow() {
    if (!this.activePlant) {
      return
    }
    if (this.overBranchLimit) {
      this.showModal = true
      return
    }
    this.growPlant(this.activePlant)
  }

  public get showColors(): ActivePlantInfo[] {
    return [
      {
        text: "Flower colors",
        value: this.activePlant?.main_species.flower.color,
      },
      {
        text: "Foliage colors",
        value: this.activePlant?.main_species.foliage.color,
      },
    ]
  }

  public get showFields(): ActivePlantInfo[] {
    return [
      {
        text: "Foliage texture",
        value: this.activePlant?.main_species.foliage.texture,
      },
      {
        text: "Average height",
        value: this.activePlant?.main_species.specifications.average_height.cm,
      },
      {
        text: "Shape and orientation",
        value: this.activePlant?.main_species.specifications
          .shape_and_orientation,
      },
      {
        text: "Growth spread",
        value: this.activePlant?.main_species.growth.spread.cm,
      },
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
