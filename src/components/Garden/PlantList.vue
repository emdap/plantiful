<template>
  <div
    id="search-results"
    ref="plant-list"
    class="h-full overflow-auto scrollbar-light dark:scrollbar-dark"
  >
    <div
      v-for="(plant, index) in plantList"
      :key="plant.id"
      @click="optionClicked(plant.id, 'show-active')"
      class="py-2 px-4 text-left h-22 grid grid-cols-3 items-center"
      :class="
        plantListLoading
          ? 'text-gray-300 dark:text-gray-600 cursor-wait'
          : 'hover:bg-green-200 dark:hover:bg-gray-600 hover:tracking-wide transition-text'
      "
    >
      <div class="col-span-2 cursor-pointer flex items-center">
        <div class="w-20 h-20 mr-2">
          <div
            v-if="images[index] == 'N/A'"
            :title="gardenMessages.noImage"
            class="h-full w-full flex items-center justify-center"
          >
            <not-found-icon
              class="fill-current"
              :class="
                plantListLoading
                  ? 'text-gray-100 dark:text-gray-600'
                  : 'text-gray-300 dark:text-gray-500'
              "
            />
          </div>
          <img
            v-else-if="plant.image_url"
            :src="plant.image_url"
            @load="$set(images, index, true)"
            class="h-full w-full"
            :class="{ 'opacity-30': plantListLoading, hidden: !images[index] }"
          />
          <loading v-if="!images[index] && !plantListLoading" />
        </div>
        <span>
          <h3>
            {{ plant.common_name }}
          </h3>
          <h5 class="font-semibold opacity-80">
            {{ plant.scientific_name }}
          </h5>
        </span>
      </div>
      <div class="inline-block col-span-1 text-right cursor-pointer">
        <span
          v-for="option of plantListOptions"
          :key="option.action"
          :title="option.text"
          class="ml-4"
          :class="
            plantLoading || plantListLoading
              ? 'cursor-wait fill-current text-gray-300 dark:text-gray-400'
              : 'cursor-pointer icon'
          "
          @click="optionClicked(plant.id, option.action)"
        >
          <x :is="option.icon" class="inline" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GardenMixin, { garden } from "@/mixins/GardenMixin.vue"
import { Ref, Watch } from "vue-property-decorator"
import PlantLineIcon from "@/assets/icons/plant-line.svg"
import PopOutIcon from "@/assets/icons/pop-out.svg"
import NotFoundIcon from "@/assets/icons/not-found.svg"
import Loading from "@/components/Loading.vue"

@Component({
  components: {
    Loading,
    NotFoundIcon,
  },
})
export default class PlantList extends GardenMixin {
  @Ref("plant-list") readonly plantListDiv!: HTMLDivElement

  public images = [] as (boolean | "N/A")[]

  public plantListOptions = [
    {
      icon: PlantLineIcon,
      text: "Grow this plant",
      action: "grow-plant",
    },
    {
      icon: PopOutIcon,
      text: "Show more info",
      action: "show-active",
    },
  ]

  public mounted() {
    this.setImagesList()
  }

  public async optionClicked(id: number, option: string) {
    await garden.getOnePlant(id)
    this.$emit(option)
  }

  @Watch("plantList")
  public resetScroll() {
    this.plantListDiv.scrollTop = 0
    this.setImagesList()
  }

  public setImagesList() {
    this.images = []
    for (let i = 0; i < this.plantList.length; i++) {
      this.images.push(false)
    }
    setTimeout(() => {
      // remove any loaders for images that haven't loaded yet
      for (let i = 0; i < this.plantList.length; i++) {
        if (!this.images[i]) {
          this.$set(this.images, i, "N/A")
        }
      }
    }, 8000)
  }
}
</script>
