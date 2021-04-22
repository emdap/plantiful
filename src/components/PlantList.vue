<template>
  <div
    id="search-results"
    ref="plant-list"
    class="flex-grow overflow-auto scrollbar-thin scrollbar-light dark:scrollbar-dark"
  >
    <div
      v-for="(plant, index) in plantList"
      :key="`plant ${index}`"
      class="mb-2 px-4 py-2 text-left h-22 grid grid-cols-3 gap-2 items-center"
      :class="
        plantListLoading
          ? 'text-gray-300 dark:text-gray-600 cursor-wait'
          : 'hover:bg-green-200 dark:text-black dark:hover:bg-gray-600 hover:tracking-wide transition-text'
      "
    >
      <div
        class="col-span-2 cursor-pointer flex items-center"
        @click="optionClicked($event, plant.id, 'show-active')"
      >
        <img
          v-if="plant.image_url"
          :src="plant.image_url"
          class="w-20 h-20 inline-block mr-2"
          :class="{ 'opacity-30': plantListLoading }"
        />
        <span class="inline-block">
          <h3>
            {{ plant.common_name }}
          </h3>
          <h5 class="font-semibold opacity-80">
            {{ plant.scientific_name }}
          </h5>
        </span>
      </div>
      <div class="inline-block col-span-1 text-right">
        <span
          v-for="option of plantListOptions"
          :key="option.action"
          :title="option.text"
          class="ml-4 fill-current"
          :class="
            plantLoading || plantListLoading
              ? 'cursor-wait'
              : 'cursor-pointer icon dark:text-gray-400'
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

@Component({})
export default class PlantList extends GardenMixin {
  @Ref("plant-list") readonly plantListDiv!: HTMLDivElement

  public plantListOptions = [
    {
      icon: PlantLineIcon,
      text: "Grow this plant",
      action: "grow-plant"
    },
    {
      icon: PopOutIcon,
      text: "Show more info",
      action: "show-active"
    }
  ]

  public async optionClicked(id: number, option: string) {
    await garden.getOnePlant(id)
    this.$emit(option)
    // switch (option) {
    //   case "show-active":
    //     this.toggleActivePlant(true)
    //     break
    //   case "grow-plant":
    //     this.toggleGrow(true)
    //     break
    // }
  }

  @Watch("plantList")
  public resetScroll() {
    this.plantListDiv.scrollTop = 0
  }
}
</script>
